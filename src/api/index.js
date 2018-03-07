/*
 * Created by Administrator on 2017/10/11 0011.
 * author: hanbenhao
 * email: 1114386442@qq.com
 */
/** api接口  */
import apiBase from '../config/fetch'

export default {
  getStatus () {
    return apiBase.get('user/checks/1')
  }
}