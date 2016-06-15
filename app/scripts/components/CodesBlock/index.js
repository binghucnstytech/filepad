import React, { Component, PropTypes } from 'react';
import BaseBlock from 'components/BaseBlock';
import Codemirror from 'react-codemirror';
import update from 'react/lib/update';

import 'codemirror/lib/codemirror.css';
import './styles.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/markdown/markdown';

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

const languages = [
  'javascript',
  'xml',
  'markdown',
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
            {this.state.data.codes.map((data, index) => (<Tab>
              {data.language}
            </Tab>))}
          </TabList>
          {this.state.data.codes.map((data, index) => (<TabPanel>
            {this.isEditable() ?
              <div className="codes-block_bar">
                <select
                  className="codes-block_change-language"
                  value={data.language}
                  onChange={this.handleChangeLanguage.bind(this, index)}>
                  {languages.map((language) => (<option value={language}>{language}</option>))}
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
