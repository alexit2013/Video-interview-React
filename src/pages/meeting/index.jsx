import React from 'react'
import * as Cookies from 'js-cookie'

import './meeting.less'
import AgoraVideoCall from '../../components/AgoraVideoCall'
import { AGORA_APP_ID } from '../../library/Agora.config.js'
import { Input, notification, Button, Select } from 'antd';
import http from '@/api'
const AgoraRTC = require('../../library/AgoraRTC')
const Search = Input.Search
const Option = Select.Option

class Meeting extends React.Component {
  state = {
    searchFont: '',
    time: 0,
    hour: 0,
    minute: 0
  }
  constructor(props) {
    super(props)
    if (!AgoraRTC.checkSystemRequirements()) {
      let data = 'Your brower is currently out of date. Please kindly upgrade it to support video interview functionality. And we recommend Chrome browser.'
      this.openNotification(data)
    }
    this.videoProfile = (Cookies.get('videoProfile')&&Cookies.get('videoProfile').split(',')[0]) || '480p_4',
    this.channel = Cookies.get('channel')
    this.transcode = Cookies.get('transcode')
    this.attendeeMode = Cookies.get('attendeeMode')
    this.baseMode = Cookies.get('baseMode')
    if (!AGORA_APP_ID) {
      alert('Wrong AppID!')
      return
    }
    if (this.baseMode === 'avc') {
      // agora video call
      this.appId = AGORA_APP_ID
    }
    else {
      // agora live
      this.appId = AGORA_APP_ID
    }
    this.uid = undefined
  }
  // websocket处理
  roomId = Number(localStorage.getItem('roomId'))
  userId = JSON.parse(localStorage.getItem('user')).id
  async websocketfunction () {
    console.log(this.userId, 'this.userId', this.roomId, 'this.roomId')
    let wsServer = 'wss://dev-ivapi.teachfuture.org/wss?user_id=' + this.userId + '&interview_id=' + this.roomId
    this.websocket = await new WebSocket(wsServer)
    let other = this
    let heartCheck = {
      //timeout: 540000,        //9分钟发一次心跳
      //timeout: 60000,        //1分钟发一次心跳
      timeout: 180000,        //3分钟发一次心跳
      timeoutObj: null,
      serverTimeoutObj: null,
      reset: function () {
        clearTimeout(this.timeoutObj)
        clearTimeout(this.serverTimeoutObj)
        return this
      },
      start: function () {
        this.timeoutObj = setTimeout(() => {
          other.websocket.send(JSON.stringify({"heart": "ping"})); /// *心跳检测发送内容
          this.serverTimeoutObj = setTimeout(function () {
            other.websocket.close()
          }, this.timeout)
        },this.timeout)
      }
    }
    this.websocket.onopen =(evt) => {
      console.log(evt, 'onopen')
      heartCheck.reset().start()
    }
    this.websocket.onclose = (evt) => {
      console.log(evt, "onclose")
    }
    this.websocket.onmessage = async (evt) => {
      heartCheck.reset().start()
      let data = JSON.parse(evt.data)
      if (data.code + '' === '1011') {
        let pLabel = document.createElement('p')
        pLabel.innerHTML = data.users[data.user_id] + ': ' + data.message
        this.refs.chatRoom.appendChild(pLabel)
        this.refs.chatRoom.scrollTop = this.refs.chatRoom.scrollHeight
      }
      if (data.code + '' === '1005') {
        console.log(data, 'data.time')
        if (this.timer) {
          clearInterval(this.timer)
          console.log('定时器存在---》》》')
        }
        await this.setState({time: data.times})
        this.timer = window.setInterval(() => {
          this.TimeCalculation()
        }, 1000)
      }
      if (data.code + '' === '1003') {
        if (JSON.parse(localStorage.getItem('user')).role === 'institution') {
          this.TimeopenNotification()
        }
        this.openNotification(data.message)
      }
      if (data.code + '' === '1002') {
        this.openNotification(data.message)
        // 关闭计时器
        clearInterval(this.timer)
        window.history.go(-1)
      }
      if (data.code + '' === '1001' || data.code + '' === '1004') {
        let pLabel = document.createElement('p')
        pLabel.style.color = '#ffdb4a'
        console.log(pLabel.classList, 'pLabel')
        pLabel.innerHTML = data.message
        this.refs.chatRoom.appendChild(pLabel)
        this.refs.chatRoom.scrollTop = this.refs.chatRoom.scrollHeight
      }
      console.log(data, 'onmessage')
    }
    this.websocket.onclose = () => {
      console.log('websocket关闭')
    }
  }
  // 通知提醒框
  openNotification = (data) => {
    notification.open({
      message: 'Warning',
      description: data,
      duration: 0,
    });
  }
  // 用户进入房间面试埋点
  async openRoomUser() {
    let roomId = localStorage.getItem('roomId')
    let apiOpenRoomUser = await http.apiOpenRoomUser(roomId)
    console.log(apiOpenRoomUser, '-----=====......')
    if (apiOpenRoomUser.status + '' === '422') {
      window.history.go(-1)
    }
  }
  // 输入提交
  async SearchSubmission(value) {
    console.log(value)
    await this.websocket.send(JSON.stringify({"interview_id":this.roomId,"user_id":this.userId,"message": this.state.searchFont}))
  }
  // 添加面试时间
  async addTime(key) {
    await http.apiTimeadd(this.roomId)
    await this.websocket.send(JSON.stringify({"interview_id": this.roomId, "operating": "add-time"}));
    notification.close(key)
  }
  // 加时提醒通知
  TimeopenNotification () {
    const key = `open${Date.now()}`;
    const btn = (
      <div className='addtimeButton'>
        <Button onClick={() => notification.close(key)}>
          不加时
        </Button>
        <Button type="primary" onClick={this.addTime.bind(this, key)}>
          加时
        </Button>
      </div>
    );
    notification.open({
      description: '是否为房间加时？',
      btn,
      key,
      duration: 0
    })
  }
  // 时间倒计时
  async TimeCalculation () {
    let time = this.state.time - 1
    await this.setState({time: time})
    let hour = '0' + Math.floor(this.state.time /60 / 60)
    let minute = Math.ceil((this.state.time - hour * 60 * 60) / 60)
    if (minute < 10) minute = '0' + minute
    await this.setState({hour: hour, minute: minute})
  }

  componentWillMount() {
    this.openRoomUser().then(() => {
      this.websocketfunction()
    })
  }
  // 用户选择的对话语句
  async showSearchhandleChange (value) {
    let info = {
      1: 'Sorry, I can\'t see you.',
      2: 'Sorry, I can\'t hear you.',
      3: 'Sorry, there is delay/lag in the video.',
      4: 'Sorry, the sound volume is too low. I can\'t hear you clearly.'
    }
    await this.setState({searchFont: info[value]})
  }

  render() {
    return (
      <div className="wrapper meeting" style={{height: '1000px'}}>
        <div className="ag-header">
          <div className="ag-header-lead">
            <img className="header-logo" src={require('../../assets/images/ag-logo.png')} alt="" />
            <span className='timer'>面试剩余时间：{this.state.hour} : {this.state.minute}</span>
          </div>
          <div className="ag-header-msg">
            Room:&nbsp;<span id="room-name">{this.channel}</span>
          </div>
        </div>
        <div className="ag-main">
          <div className="ag-container">
            <AgoraVideoCall
              ref='AgoraVideoCall'
              videoProfile={this.videoProfile}
              channel={this.channel}
              transcode={this.transcode}
              attendeeMode={this.attendeeMode}
              baseMode={this.baseMode}
              appId={this.appId}
              uid={this.uid}></AgoraVideoCall>
          </div>
        </div>

        <div className='chatRoll'>
          <div className='container' ref='chatRoom'></div>
          <div className='inputContainer'>
            <Select
              style={{ width: '85%' }}
              placeholder="Select a person"
              size='large'
              onChange={this.showSearchhandleChange.bind(this)}
            >
              <Option value="1">Sorry, I can't see you.</Option>
              <Option value="2">Sorry, I can't hear you.</Option>
              <Option value="3">Sorry, there is delay/lag in the video.</Option>
              <Option value="4">Sorry, the sound volume is too low. I can't hear you clearly.</Option>
            </Select>
            <Button
              type="primary"
              size='large'
              onClick={this.SearchSubmission.bind(this)}
            >Search</Button>
          </div>
        </div>
      </div>
    )
  }

  componentWillUnmount () {
    this.websocket.close()
  }
}

export default Meeting