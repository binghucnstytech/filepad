import '../styles/main.scss';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import { Router, Route, Link, hashHistory, browserHistory, IndexRoute } from 'react-router';

import _ from 'lodash';

import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';

import BendUtils from 'common/bend-utils.js';

import { upload } from 'common/bend-uploader.js';

import DropZoneBar from 'containers/DropZoneBar';
import SaveIndicator from 'components/SaveIndicator';

import BasePage from './components/Layout/BasePage';
import Login from './containers/Login';
import Signup from './containers/Signup';
import Error500 from './containers/Error500';
import NotFound from './containers/NotFound';
import AppWrapper from 'containers/App';
import Dashboard from './containers/Dashboard.js';

@DragDropContext(HTML5Backend)
class App extends Component {
  render() {
    return <AppWrapper padID={this.props.params.padID} />;
  }
}

/*const appHistory = useRouterHistory(createHistory)({
  basename: '/'
})*/

function initBend(callback) {
  callback = callback || function () {};

  var appKey = '55a327c84bad3037970043b5';
  var appSecret = 'zF6GQ4J3Bo9wbVBfZyF6gZ9muL3b63VByzNo551R';
  if (localStorage) {
    localStorage.removeItem(`Bend.${appKey}.activeUser`);
  }

  BendUtils.wrapInCallback(Bend.init({
    appKey: appKey,
    appSecret: appSecret,
  }), (err, activeUser) => {
    if (err) {
      callback(err);
      return;
    }

    if (!activeUser) {
      /*BendUtils.wrapInCallback(Bend.User.login({
        username: 'admin',
        password: 'admin123',
      }), (err, res) => {
        if (err) {
          callback(err);
          return;
        }

        callback(null, res);
      });*/
      callback(null, null);
    } else {
      callback(null, activeUser);
    }
  });
}

function requireAuth(nextState, replace) {
  if (!Bend.getActiveUser()) {
    replace({
      pathname: '/login',
      state: { nextPathname: nextState.location.pathname }
    })
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initBend((err) => {
    if (err) {
      console.log('Error while initializing bend!');
      console.log(err);
      return;
    }

    var routes =  (
      <Router history={hashHistory}>
        <Route path="/" component={BasePage}>
          <IndexRoute component={Dashboard} onEnter={requireAuth}/>
          <Route path="pad/:padID" component={App} onEnter={requireAuth}/>
          <Route path="login" component={Login}/>
          <Route path="signup" component={Signup}/>
          <Route path="error500" component={Error500}/>
          <Route path="notFound" component={NotFound}/>
        </Route>

        <Route path="*" component={NotFound}/>
      </Router>
    );

    ReactDOM.render(routes, document.querySelector('#content'));
  });
});
