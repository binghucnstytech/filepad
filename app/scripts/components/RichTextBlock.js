import React, { Component, PropTypes } from 'react';
import BaseBlock from 'components/BaseBlock';
import ContentEditable from './content-editable.js'

export default class RichTextBlock {
  static propTypes = {
    data: PropTypes.object,
    id: PropTypes.string,
  };

  static defaultProps = {
    data: {
      text: 'Free-form text goes here. Click to edit...',
    },
  };

  render() {
    if (this.isEditable()) {
      return (
        <div className="text-block">
          <div className="content">
            <div dangerouslySetInnerHTML={{ __html: data.text }} />
          </div>
        </div>
      );
    } else {
      return (
        <div className="text-block">
          <div className="content">
            <div dangerouslySetInnerHTML={{ __html: data.text }} />
            <div>
              <ContentEditable
                html={data.text}
                onChange={::this.handleTextChange}
              />
            </div>
          </div>
        </div>
      );
    }
  }
}
