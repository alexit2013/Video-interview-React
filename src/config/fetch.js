/*
 * Created by Administrator on 2017/10/11 0011.
 * author: hanbenhao
 * email: 1114386442@qq.com
 */
import config from '../env'
const api = config.apiURL
require('babel-polyfill')
require('es6-promise').polyfill();

class apiBase {
  constructor(name, options) {

  }
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
    let body = this.getSerialization(options)
    let request = {
      method: 'POST'
    }
    if (body) request['body'] = body
    request = this.tokenHeader(request)
    return fetch(api + name, request).then((res) => {
      let data = res.json()
      if (res.status === 200) {
        return data
      }
    })
  }
}

export default new apiBase()