import React from 'react'
import * as Cookies from 'js-cookie'

import './meeting.less'
import AgoraVideoCall from '../../components/AgoraVideoCall'
import { AGORA_APP_ID } from '../../library/Agora.config.js'
import { Input, notification } from 'antd';
import http from '@/api'
const AgoraRTC = require('../../library/AgoraRTC')
const Search = Input.Search;

class Meeting extends React.Component {
  constructor(props) {
    super(props)
    this.websocketfunction()
    if (!AgoraRTC.checkSystemRequirements()) {
      this.openNotification()
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
    this.openRoomUser()
  }
  // websocket处理
  websocketfunction () {
    let roomId = localStorage.getItem('roomId')
    let userId = JSON.parse(localStorage.getItem('user')).id
    let wsServer = 'ws://106.14.63.74:9501?user_id=' + userId + '&interview_id=' + roomId
    // let wsServer = 'ws://106.14.63.74:9501?user_id=' + '1049' + '&interview_id=' + '194'
    let websocket = new WebSocket(wsServer)
    websocket.onopen = function (evt) {
      console.log(evt.data, '-----;;;;;;');
    }
    websocket.onclose = function (evt) {
      console.log("Disconnected");
    }
    websocket.onmessage = function (evt) {
      console.log(evt.data);
    }
    websocket.onerror = function (evt, e) {
      console.log('Error occured: ' + evt.data);
    }
  }
  // 通知提醒框
  openNotification = () => {
    notification.open({
      message: 'Warning',
      description: 'Your brower is currently out of date. Please kindly upgrade it to support video interview functionality. And we recommend Chrome browser.',
      duration: 0,
    });
  };
  // 用户进入房间面试埋点
  async openRoomUser() {
    let roomId = localStorage.getItem('roomId')
    let apiOpenRoomUser = await http.apiOpenRoomUser(roomId)
    console.log(apiOpenRoomUser, '-----=====......')
    if (apiOpenRoomUser.status + '' === '422') {
      // window.history.go(-1)
    }
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
            <Search placeholder="input search text" enterButton="Search" size="large" />
          </div>
        </div>
      </div>
    )
  }
}

export default Meeting