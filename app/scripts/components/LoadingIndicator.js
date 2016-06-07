import React, { Component, PropTypes } from 'react';
import Spinner from 'react-spinkit';

export default class LoadingIndicator extends Component {
    static defaultProps = {
        visible: false
    };

    static propTypes = {
        visible: PropTypes.bool
    };

    render() {
        return (
            <div className={"loading-indicator" + (this.props.visible ? " active": "")}>
                <Spinner spinnerName='three-bounce'/>
            </div>
        );
    }
}