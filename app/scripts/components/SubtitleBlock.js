import React, { Component, PropTypes } from 'react';
import BaseBlock from './BaseBlock.js'
import ContentEditable from './content-editable.js'

export default class SubtitleBlock extends BaseBlock {
    static propTypes = {
        data: React.PropTypes.object,
    };

    static defaultProps = {
        data: {
            text: "Sub-title. Click to Edit."
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
            <div className="subtitle-block">
                <div className="content">
                    <h3 dangerouslySetInnerHTML={{__html: data.text}}></h3>
                </div>
            </div>
        )
    }

    renderEditable() {
        const { data, needFocus } = this.props;
        return (
            <div className="subtitle-block">
                <div className="content">
                    <h3><ContentEditable focus={needFocus} html={data.text} onChange={this.handleTextChange.bind(this)}/></h3>
                </div>
            </div>
        )
    }

    render() {
        return this.isEditable() ? this.renderEditable() : this.renderStatic();
    }
}