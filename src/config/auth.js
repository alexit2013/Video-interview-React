/** 处理Cookies中的令牌参数  */

import Cookies from 'js-cookie';

export default async function () {
  let accessToken = Cookies.get('auth/accessToken')
  let user = Cookies.get('auth/user')

  localStorage.setItem('accessToken', accessToken)
  localStorage.setItem('user', user)
}

