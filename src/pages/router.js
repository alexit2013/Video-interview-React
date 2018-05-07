import React, { Component } from 'react'
import { HashRouter, Route, Switch } from 'react-router-dom'
import 'bulma/css/bulma.css'
import store from '@/store/store';
import {Provider} from 'react-redux';

import login from './login/index'
import Meeting from './meeting'
import interviewList from './interviewList'

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <HashRouter>
          <Switch>
            <Route exact path="/" component={login} />
            <Route exact path='/interviewList' component={interviewList}/>
            <Route path="/meeting" component={Meeting} />
          </Switch>
        </HashRouter>
      </Provider>
    )
  }
}

export default App
