import * as login from './action-type';

// 保存表单数据
export const userInfoAction = (value) => {
  console.log(value, 'value')
  return {
    type: login.USERINFO,
    value
  }
}


