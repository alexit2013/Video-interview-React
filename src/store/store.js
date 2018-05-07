import {createStore, combineReducers, applyMiddleware} from 'redux';
import * as login from './login/reducer';
// import * as production from './production/reducer';
import thunk from 'redux-thunk';

let store = createStore(
  // combineReducers({...home, ...production}),
  combineReducers({...login}),
  applyMiddleware(thunk)
);

export default store;