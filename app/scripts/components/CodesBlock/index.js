import React, { Component, PropTypes } from 'react';
import BaseBlock from 'components/BaseBlock';
import Codemirror from 'react-codemirror';
import update from 'react/lib/update';

import 'codemirror/lib/codemirror.css';
import './styles.css';

import 'codemirror/mode/apl/apl';
import 'codemirror/mode/asciiarmor/asciiarmor';
import 'codemirror/mode/asterisk/asterisk';
import 'codemirror/mode/clojure/clojure';
import 'codemirror/mode/cmake/cmake';
import 'codemirror/mode/coffeescript/coffeescript';
import 'codemirror/mode/commonlisp/commonlisp';
import 'codemirror/mode/crystal/crystal';
import 'codemirror/mode/css/css';
import 'codemirror/mode/d/d';
import 'codemirror/mode/dart/dart';
import 'codemirror/mode/dockerfile/dockerfile';
import 'codemirror/mode/elm/elm';
import 'codemirror/mode/erlang/erlang';
import 'codemirror/mode/go/go';
import 'codemirror/mode/groovy/groovy';
import 'codemirror/mode/haml/haml';
import 'codemirror/mode/haskell/haskell';
//import 'codemirror/mode/jade/jade';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/jinja2/jinja2';
import 'codemirror/mode/jsx/jsx';
import 'codemirror/mode/lua/lua';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/mode/nginx/nginx';
import 'codemirror/mode/pascal/pascal';
import 'codemirror/mode/perl/perl';
import 'codemirror/mode/php/php';
import 'codemirror/mode/powershell/powershell';
import 'codemirror/mode/ruby/ruby';
import 'codemirror/mode/rust/rust';
import 'codemirror/mode/sass/sass';
import 'codemirror/mode/scheme/scheme';
import 'codemirror/mode/shell/shell';
import 'codemirror/mode/slim/slim';
import 'codemirror/mode/sql/sql';
import 'codemirror/mode/stylus/stylus';
import 'codemirror/mode/swift/swift';
import 'codemirror/mode/tcl/tcl';
import 'codemirror/mode/twig/twig';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/yaml/yaml';

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

const languages = [
  'apl',
  'asciiarmor',
  'asterisk',
  'clojure',
  'cmake',
  'coffeescript',
  'commonlisp',
  'crystal',
  'css',
  'd',
  'dart',
  'dockerfile',
  'elm',
  'erlang',
  'go',
  'groovy',
  'haml',
  'haskell',
  'jade',
  'javascript',
  'jinja2',
  'jsx',
  'lua',
  'markdown',
  'nginx',
  'pascal',
  'perl',
  'php',
  'powershell',
  'ruby',
  'rust',
  'sass',
  'scheme',
  'shell',
  'slim',
  'sql',
  'stylus',
  'swift',
  'tcl',
  'twig',
  'xml',
  'yaml',
];

export default class CodesBlock extends BaseBlock {
  constructor(props) {
    super(props);
    this.state = {
      data: this.props.data,
    };
  }

  notifyChange() {
    if (this.props.onChange) {
      this.props.onChange(this.props.id, this.state.data);
    }
  }

  handleAddTab() {
    this.setState(update(this.state, {
      data: {
        codes: {
          $push: [
            {
              language: 'javascript',
              text: '',
            },
          ],
        },
      },
    }), () => this.notifyChange());
  }

  handleRemoveTab(index) {
    this.setState(update(this.state, {
      data: {
        codes: {
          $splice: [[index, 1]],
        },
      },
    }), () => this.notifyChange());
  }

  handleChangeLanguage(index, e) {
    this.setState(update(this.state, {
      data: {
        codes: {
          [index]: {
            language: { $set: e.target.value },
          },
        },
      },
    }), () => this.notifyChange());
  }

  handleChangeText(index, newValue) {
    this.setState(update(this.state, {
      data: {
        codes: {
          [index]: {
            text: { $set: newValue },
          },
        },
      },
    }), () => this.notifyChange());
  }

  render() {
    return (
      <div className="codes-block">
        {this.isEditable() ?
          <button className="codes-block_add-button" onClick={::this.handleAddTab}>+</button>
          : null}
        <Tabs>
          <TabList>
            {this.state.data.codes.map((data, index) => (<Tab key={'tab_' + index}>
              {data.language}
            </Tab>))}
          </TabList>
          {this.state.data.codes.map((data, index) => (<TabPanel key={'tabPanle_' + index}>
            {this.isEditable() ?
              <div className="codes-block_bar">
                <select
                  className="codes-block_change-language"
                  value={data.language}
                  onChange={this.handleChangeLanguage.bind(this, index)}>
                  {languages.map((language, index) => (<option key={'option_' + index} value={language}>{language}</option>))}
                </select>

                <a
                  className="codes-block_remove-tab"
                  href="#"
                  onClick={(e) => {
                  e.preventDefault();
                  this.handleRemoveTab(index);
                }}>remove</a>
              </div>
              : null}

            <Codemirror
              value={data.text}
              onChange={this.handleChangeText.bind(this, index)}
              options={{
                lineNumbers: true,
                mode: 'javascript',
                readOnly: this.isEditable() ? false : 'nocursor',
              }}
            />
          </TabPanel>))}
        </Tabs>

      </div>
    );
  }
}
