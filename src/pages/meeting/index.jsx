import React from 'react'
import * as Cookies from 'js-cookie'

import './meeting.less'
import AgoraVideoCall from '../../components/AgoraVideoCall'
import { AGORA_APP_ID } from '../../library/Agora.config.js'
import { Input, notification, Button } from 'antd';
import http from '@/api'
const AgoraRTC = require('../../library/AgoraRTC')
const Search = Input.Search;

class Meeting extends React.Component {
  constructor(props) {
    super(props)
    this.websocketfunction()
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
  async componentWillMount () {
    await this.openRoomUser()
  }
  // websocket处理
  roomId = localStorage.getItem('roomId')
  userId = JSON.parse(localStorage.getItem('user')).id
  websocketfunction () {
    let wsServer = 'wss://dev-swoole.teachfuture.org?user_id=' + this.userId + '&interview_id=' + this.roomId
    this.websocket = new WebSocket(wsServer)
    this.websocket.onopen =(evt) => {
      console.log(evt, 'onopen')
    }
    this.websocket.onclose = (evt) => {
      console.log(evt, "onclose")
    }
    this.websocket.onmessage = (evt) => {
      let data = JSON.parse(evt.data)
      if (data.code + '' === '1003') {
        if (JSON.parse(localStorage.getItem('user')).role === 'institution') {
          this.TimeopenNotification()
        }
        this.openNotification(data.message)
      }
      if (data.code + '' === '1002') {
        this.refs.AgoraVideoCall.handleExit()
        this.openNotification(data.message)
      }
      console.log(data, 'onmessage')
    }
    // this.websocket.onerror = (evt, e) => {
    //   console.log('Error occured: ' + evt.data)
    // }
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
    this.websocket.send(JSON.stringify({"interview_id":this.roomId,"user_id":this.userId,"message": "12345678900"}))
  }
  // 添加面试时间
  async addTime(key) {
    await http.apiTimeadd(this.roomId)
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
  render() {
    return (
      <div className="wrapper meeting" style={{height: '1000px'}}>
        <div className="ag-header">
          <div className="ag-header-lead">
            <img className="header-logo" src={require('../../assets/images/ag-logo.png')} alt="" />
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
          <div className='container'>

          </div>
          <div className='inputContainer'>
            <Search onSearch={this.SearchSubmission.bind(this)} placeholder="input search text" enterButton="Search" size="large" />
          </div>
          {/*<Button type="primary" onClick={this.TimeopenNotification.bind(this)}>*/}
            {/*加时提醒通知*/}
          {/*</Button>*/}
        </div>
      </div>
    )
  }
}

export default Meeting