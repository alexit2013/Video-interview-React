/** api接口  */
import apiBase from '../config/fetch'

export default {
  // 登陆
  apiSignIn (data) {
    return apiBase.post('sign/in', data)
  },
  // 获取用户信息
  apiUserInfo () {
    return apiBase.post('user/view')
  },
  // 获取用户面试信息
  apiInterview () {
    return apiBase.post('interview/index')
  },
  // 用户进入房间面试埋点
  apiOpenRoomUser (id) {
    return apiBase.post(`interview/open?id=${id}`)
  },
  // 面试加时接口
  apiTimeadd (id) {
    return apiBase.post(`/interview/add-time?id=${id}`)
  }
}