import React, { Component, PropTypes } from 'react';
import classes from 'classnames'

export default class ProgressBar extends Component {
    static propTypes = {
        progress: PropTypes.number,
        visible: PropTypes.bool,
        animate: PropTypes.bool,
        labelText: PropTypes.string
    };

    static defaultProps = {
        progress: 0,
        visible: true,
        animate: true,
        labelText: ""
    };

    render() {
        const { visible, progress, animate, labelText } = this.props;
        var rootStyle = {
            display: visible ? 'block' : 'none'
        };

        var progressStyle = {
            width: Math.round(progress)+'%'
        };

        return (
            <div className="thumb-progress-bar thumb-layout" style={rootStyle}>
                <div className="channel"></div>
                <div className="progress" style={progressStyle}>{animate ? (<span className={animate ? 'animate' : ''}></span>) : null}</div>
                <span className="label">{labelText ? labelText : `${Math.round(progress)}%`}</span>
            </div>
        );
    }
}