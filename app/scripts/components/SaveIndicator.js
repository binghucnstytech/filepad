import React, { Component, PropTypes } from 'react';

export default class SaveIndicator extends Component {
  static propTypes = {
    visible: PropTypes.bool,
  };

  static defaultProps = {
    visible: false,
  };

  render() {
    const { visible } = this.props;
    var style = {
      display: visible ? 'block' : 'none',
      textAlign: 'right',
    };
    return (
      <div style={style}>Saving...</div>
    );
  }
}
