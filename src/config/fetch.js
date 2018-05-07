import config from '../env'
import { message } from 'antd';
const api = config.apiURL
require('babel-polyfill')
require('es6-promise').polyfill();

class apiBase {
  tokenHeader(options) {
    let accessToken = localStorage.getItem("accessToken")
    if (accessToken !== 'undefined') {
      options.headers = {
        "Authorization": `Bearer ${accessToken}`
      }
    }
    return options
  }
  getSerialization(obj) {
    let query = [];
    if (obj) {
      Object.keys(obj).forEach((key) => {
        query.push(key + '=' + obj[key]);
      })
      return query.join('&')
    }
  }
  // get请求
  get(name, options) {
    if (options) {
      name = api + name + '?' + this.getSerialization(options)
    } else {
      name = api + name
    }
    let config = {
      method: 'GET'
    }
    config = this.tokenHeader(config)
    return fetch(name, config).then(res => {
      return res.json().then((ret) => {
        return ret
      })
    }).catch(err => {
      console.log(err)
    })
  }
  // post请求
  post(name, options) {
    let body = JSON.stringify(options)
    let request = {
      method: 'POST'
    }
    request = this.tokenHeader(request)
    if (body) request['body'] = body
    console.log(request, 'request')
    return fetch(api + name, request).then((res) => {
      console.log(res, 'res')
      if (res.status === 200) {
        return res.json().then((ret) => {
          return ret
        })
      } else {
        return res.json().then((ret) => {
          message.warning(ret.message)
          if (ret.status === 401) {
            window.location.hash = ''
            return false
          }
          return ret
        })
      }
    })
  }
}

export default new apiBase()