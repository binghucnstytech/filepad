import React, { Component, PropTypes } from 'react';

export default class BaseBlock extends Component {
    static propTypes = {
        viewMode: React.PropTypes.string
    };

    static defaultProps = {
        viewMode: 'preview'
    };
    constructor(props) {
        super(props);
    }

    isEditable() {
        return this.props.viewMode === 'editor';
    }

    render() {
        return (
            <div>
            </div>
        )
    }
}