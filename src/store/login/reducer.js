import * as home from './action-type';

export const userInfo = (state = {} , action = {}) => {
  console.log(state, 'state-----reducer')
  switch(action.type){
    case home.USERINFO:
      return {...state, ...{[action.datatype]: action.value}};
    default:
      return state;
  }
}

