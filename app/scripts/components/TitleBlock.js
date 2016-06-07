import React, { Component, PropTypes } from 'react';
import BaseBlock from './BaseBlock.js'
import ContentEditable from './content-editable.js'

export default class TitleBlock extends BaseBlock {
    static propTypes = {
        data: React.PropTypes.object,
    };

    static defaultProps = {
        data: {
            text: "Title. Click to Edit."
        }
    };

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
            <div className="title-block">
                <div className="content">
                    <h1 dangerouslySetInnerHTML={{__html: data.text}}></h1>
                </div>
            </div>
        )
    }

    renderEditable() {
        const { data, needFocus } = this.props;
        return (
            <div className="title-block">
                <div className="content">
                    <h1><ContentEditable focus={needFocus} html={data.text} onChange={this.handleTextChange.bind(this)}/></h1>
                </div>
            </div>
        )
    }

    render() {
        return this.isEditable() ? this.renderEditable() : this.renderStatic();
    }
}