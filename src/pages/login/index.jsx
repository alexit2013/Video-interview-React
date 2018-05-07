import React from 'react'
import * as Cookies from 'js-cookie'
import PropTypes from 'prop-types';
import { userInfoAction } from '@/store/login/action';
import { connect } from 'react-redux';
import '@/assets/fonts/css/icons.css'
import './index.less'
import { Input, Button, message, Spin, notification } from 'antd'
import http from '@/api'

class Index extends React.Component {
  state = {
    Email: '',
    Password: '',
    loading: false,
    SpinLoading: true,
    isShow: false,
    video: {},
    userInfo: {}
  }

  static propTypes = {
    userInfo: PropTypes.object.isRequired,
    userInfoAction: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)
    this.BrowserJudge()
  }

  componentDidMount() {
    window.addEventListener('keypress', (e) => {
      e.keyCode === 13 && this.handleJoin()
    })
    this.NoLogin()
  }

  // 设置Cookies
  handleJoin = (even) => {
    Cookies.set('baseMode', this.state.video.baseMode)
    Cookies.set('transcode', this.state.video.transcode)
    Cookies.set('attendeeMode', this.state.video.attendeeMode)
    Cookies.set('videoProfile', this.state.video.videoProfile)
    if (even === 1) {
      Cookies.set('channel', '1')
      this.props.history.push('/meeting')
    }
  }
  // 处理用户免登陆 登陆令牌
  NoLogin = async () => {
    let accessToken = Cookies.get('auth/accessToken')
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken)
      await this.postUserInfo()
      this.setState({SpinLoading: false})
    } else {
      this.setState({SpinLoading: false})
    }
  }
  // 通知提醒框 用户登陆后没有面试会提醒用户并且拦截
  openNotification = () => {
    notification.open({
      message: 'Warning',
      description: 'You don\'t have a scheduled interview.',
      duration: 0,
    });
  };
  // 登陆
  enterLoading = () => {
    if (!this.state.Email || !this.state.Password) {
      message.warning('请填写用户名和密码')
      return false
    }
    let data = {
      username: this.state.Email,
      password: this.state.Password
    }
    this.setState({ loading: true })
    http.apiSignIn(data).then((res) => {
      localStorage.setItem('accessToken', res.access_token)
      this.postUserInfo()
    })
  }
  // 获取用户信息  获取用户面试信息
  postUserInfo = async () => {
    let apiUserInfo = await http.apiUserInfo()
    this.setState({ loading: false })
    if (apiUserInfo) {
      apiUserInfo = JSON.stringify(apiUserInfo)
      localStorage.setItem('user', apiUserInfo)
      this.props.userInfoAction(apiUserInfo)
      let apiInterview = await http.apiInterview()
      if (JSON.stringify(apiInterview) === '[]') {
        this.openNotification()
      } else {
        if (apiInterview.length > 1) {
          this.props.history.push('/interviewList')
        } else {
          localStorage.setItem('roomId', apiInterview[0].interview_id)
          Cookies.set('channel', apiInterview[0].interview_id)
          this.props.history.push('/meeting')
        }
      }
    }
  }
  // input输入更新数据
  handleChange (even) {
    this.setState({[even.target.name]: even.target.value})
  }
  /**
   * 浏览器配置
   * Chrome 浏览器，Chrome 58 及以上版本（仅支持 HTTPS）
   * Firefox 浏览器，Firefox 56 及以上版本（仅支持 HTTPS）
   * Opera 浏览器，Opera 45 及以上版本（仅支持 HTTPS）
   * Safari 浏览器，Safari 11 及以上版本（仅支持 HTTPS）
   **/
  BrowserJudge () {
    let regFirefox = /firefox\/[\d.]+/gi
    let regChrome = /chrome\/[\d.]+/gi
    let regOpera = /OPR\/[\d.]+/gi
    let regSafari = /Version\/[\d.]+/gi
    let userAgent = navigator.userAgent

    // let appVersion = navigator.appVersion
    // console.log(appVersion, '浏览器的版本号')
    // 谷歌 欧朋 火狐配置
    let configChrome = {
      isShow: true,
      baseMode: 'al',
      transcode: 'h264_interop',
      attendeeMode: 'video',
      videoProfile: '480p'
    }
    // 苹果配置
    let configSafari = {
      isShow: true,
      baseMode: 'al',
      transcode: 'h264_interop',
      attendeeMode: 'video',
      videoProfile: '480p'
    }
    if (userAgent.indexOf('OPR') !== -1) {
      // 欧朋浏览器
      console.log(userAgent.match(regOpera)[0], '欧朋浏览器')

      let version = userAgent.match(regOpera)[0]
      version = version.match('\\/([0-9]+)\\.')[1] + ''

      if (version > '45') {
        for (const i in configChrome) {
          this.state.video[i] = configChrome[i]
        }
        this.handleJoin()
      }
    }
    if (userAgent.indexOf('Firefox') !== -1) {
      // 火狐浏览器
      console.log(userAgent.match(regFirefox)[0], '火狐浏览器')

      let version = userAgent.match(regFirefox)[0]
      version = version.match('\\/([0-9]+)\\.')[1] + ''

      if (version > '56') {
        for (const i in configChrome) {
          this.state.video[i] = configChrome[i]
        }
        this.handleJoin()
      }

    }
    if (userAgent.indexOf('Chrome') !== -1) {
      // 谷歌浏览器
      console.log(userAgent.match(regChrome)[0], '谷歌浏览器')

      let version = userAgent.match(regChrome)[0]
      version = version.match('\\/([0-9]+)\\.')[1] + ''

      if (version > '58') {
        for (const i in configChrome) {
          this.state.video[i] = configChrome[i]
        }
        this.handleJoin()
      }
    }
    if (userAgent.indexOf('Version') !== -1) {
      // 苹果浏览器
      console.log(userAgent.match(regSafari)[0], '苹果浏览器')

      let version = userAgent.match(regSafari)[0]
      version = version.match('\\/([0-9]+)\\.')[1] + ''

      if (version > '10') {
        for (const i in configSafari) {
          this.state.video[i] = configChrome[i]
        }
        this.handleJoin()
      }
    }
  }
  // 页面loading
  showSpinLoading = () => {
    let dom
    if (this.state.SpinLoading) {
      dom = <div className='example'>
        <Spin spinning = {true} size="large" />
      </div>
    }
    return dom
  }
  // 身份处理
  identity = (even) => {
    if (even === 1) {
      localStorage.setItem('identity', 'user')
      console.log(localStorage.getItem('identity'), 'localStorage.getItem(\'identity\')')
    } else {
      localStorage.setItem('identity', 'admin')
      console.log(localStorage.getItem('identity'), 'localStorage.getItem(\'identity\')')
    }
  }

  render() {
    return (
      <div className="wrapper index" style={{height:  document.body.offsetHeight + 'px'}}>
        {this.showSpinLoading()}
        <div className="ag-main">
          <section className="login-wrapper">
            <div className="login-header">
              <img src={require('../../assets/images/ag-logo.png')} alt="" />
            </div>
            <div className="login-input-Account">
              <Input placeholder="Email" name='Email' onChange={this.handleChange.bind(this)} />
            </div>
            <div className="login-input-Account">
              <Input type='password' placeholder="Password" name='Password' onChange={this.handleChange.bind(this)} />
            </div>
            <div className="login-input-Account">
              <Button type="primary" loading={this.state.loading} onClick={this.enterLoading}>
                login
              </Button>
            </div>
            <div className="login-footer">
              <a id="joinBtn"
                onClick={this.handleJoin.bind(this, 1)}
                className="ag-rounded button is-info">Join
                  </a>
            </div>
          </section>
        </div>
      </div>
    )
  }
}
export default connect(state => ({userInfo: state.userInfo}), {userInfoAction})(Index)