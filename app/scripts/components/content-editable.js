import React from 'react';
import ReactDOM from 'react-dom'

export default class ContentEditable extends React.Component {
    constructor() {
        super();
        this.emitChange = this.emitChange.bind(this);
    }

    handleBlur(e) {
        this.emitChange(e);
        if(this.props.onBlur) {
            this.props.onBlur(e);
        }
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.html !== ReactDOM.findDOMNode(this).innerHTML;
    }

    componentDidMount() {
        if(this.props.focus) {
            var node = ReactDOM.findDOMNode(this.refs.contentDiv);
            if(node) {
                node.focus();
                // node.select();

                var range = document.createRange();
                range.selectNodeContents(node);
                var sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
    }

    componentDidUpdate() {
        if ( this.props.html !== ReactDOM.findDOMNode(this).innerHTML ) {
            React.findDOMNode(this).innerHTML = this.props.html;
        }
    }

    emitChange(evt) {
        var html = ReactDOM.findDOMNode(this).innerHTML;
        if (this.props.onChange && html !== this.lastHtml) {
            evt.target = { value: html };
            this.props.onChange(evt);
        }
        this.lastHtml = html;
    }

    render() {
        const divProps = Object.assign({}, this.props);
        delete divProps.html;
        delete divProps.focus;

        return <div
            {...divProps}
            ref="contentDiv"
            onInput={this.emitChange}
            onBlur={this.handleBlur.bind(this)}
            className="no-outline"
            contentEditable="true"
            dangerouslySetInnerHTML={{__html: this.props.html}}></div>;
    }
}
