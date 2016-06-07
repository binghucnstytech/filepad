import React, { Component, PropTypes } from 'react';
import BaseBlock from './BaseBlock.js'
import ContentEditable from './content-editable.js'

export default class FooterBlock extends BaseBlock {
    constructor(props) {
        super(props);
    }

    handleTextChange(e) {
        if(this.props.onChange){
            this.props.onChange(this.props.id,{
                text: e.target.value
            });
        }
    }

    renderStatic() {
        const { data } = this.props;
        return (
            <div className="footer-block">
                <div className="content">
                    <div dangerouslySetInnerHTML={{__html: data.text}}></div>
                </div>
            </div>
        )
    }

    renderEditable() {
        const { data, needFocus } = this.props;
        return (
            <div className="footer-block">
                <div className="content">
                    <div><ContentEditable focus={needFocus} html={data.text} onChange={this.handleTextChange.bind(this)}/></div>
                </div>
            </div>
        )
    }

    render() {
        return this.isEditable() ? this.renderEditable() : this.renderStatic();
    }
}