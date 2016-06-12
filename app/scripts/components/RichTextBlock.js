import React, { Component, PropTypes } from 'react';
import RichTextEditor from 'react-rte';
import BaseBlock from 'components/BaseBlock';
import ContentEditable from './content-editable.js'

export default class RichTextBlock extends BaseBlock {
  static propTypes = {
    data: PropTypes.object,
    id: PropTypes.string,
  };

  static defaultProps = {
    data: {
      text: 'Free-form text goes here. Click to edit...',
    },
  };

  constructor(props) {
    super(props);

    this.state = {
      value: RichTextEditor.createValueFromString(props.data.text, 'html'),
    };
  }

  handleChange(value) {
    this.setState({value});
    if (this.props.onChange) {
      this.props.onChange(this.props.id, {
        text: value.toString('html'),
      });
    }
  }

  render() {
    const { data } = this.props;

    if (this.isEditable()) {
      return (
        <div className="text-block">
          <div className="content">
            <RichTextEditor
              value={this.state.value}
              onChange={::this.handleChange}
            />
          </div>
        </div>
      );
    } else {
      return (
        <div className="text-block">
          <div className="content">
            <div dangerouslySetInnerHTML={{ __html: data.text }} />
          </div>
        </div>
      );
    }
  }
}
