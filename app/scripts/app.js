import '../styles/main.scss';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import { Router, Route, Link, hashHistory } from 'react-router';

import _ from 'lodash';

import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';

import BendUtils from 'common/bend-utils.js';

import { upload } from 'common/bend-uploader.js';

import DropZoneBar from 'containers/DropZoneBar';
import SaveIndicator from 'components/SaveIndicator';
import AppWrapper from 'containers/App';

import AppEx from './containers/App.js';
import Dashboard from './views/Dashboard.js';

@DragDropContext(HTML5Backend)
class App extends Component {
  render() {
    return <AppWrapper padID={this.props.params.padID} />;
  }
}

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

    if (!Bend.getActiveUser()) {
      BendUtils.wrapInCallback(Bend.User.login({
        username: 'admin',
        password: 'admin123',
      }), (err, res) => {
        if (err) {
          callback(err);
          return;
        }

        callback(null, res);
      });
    } else {
      callback(null, Bend.getActiveUser());
    }
  });
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
        <Route path="/" component={Dashboard}/>
        <Route path="/pad/:padID" component={App}/>
      </Router>
    );

    ReactDOM.render(routes, document.querySelector('#content'));
  });
});
