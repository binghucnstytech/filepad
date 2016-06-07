import React, { Component, PropTypes } from 'react';
import { DragSource, DropTarget } from 'react-dnd';
import Types from './DNDType.js'
import BlockType from './BlockType.js'
import classes from 'classnames';


const blockSource = {
    beginDrag(props) {
        return {
            type: props.type,
            mode: props.mode
        };
    }
};

@DragSource(Types.BlockPreset, blockSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
}))
class SidebarBlock extends Component {
    iconClassWithBlockType(type,mode) {
        switch(type) {
            case BlockType.Title:
                return "ic-page-header";
            case BlockType.Subtitle:
                return "ic-section-header";
            case BlockType.SingleFile:
                return "ic-single-file";
            case BlockType.TwoFiles:
                return "ic-two-files";
            case BlockType.FileList:
                return mode === 'list' ? "ic-file-list" : "ic-thumbnails";
            case BlockType.Text:
                return "ic-paragraph";
            case BlockType.Footer:
                return "ic-footer";
        }
    }

    render() {
        const { isDragging, connectDragSource, type, mode } = this.props;

        var style = {
            opacity: isDragging ? 0.4 : 1
        };

        return connectDragSource(
            <div className="sidebar-block" style={style}>
                <div className={classes('icon',this.iconClassWithBlockType(type,mode))}></div>
                <p>{this.props.name}</p>
            </div>
        )
    }
}


export default class Sidebar extends Component {
    render() {
        return (
            <div className="sibebar">
                <div>
                    <SidebarBlock name={"Page Header"} type={BlockType.Title}/>
                    <SidebarBlock name={"Section Header"} type={BlockType.Subtitle}/>
                    <SidebarBlock name={"Single File"} type={BlockType.SingleFile}/>
                    <SidebarBlock name={"Two Files"} type={BlockType.TwoFiles}/>
                    <SidebarBlock name={"Thumbnails List"} type={BlockType.FileList} mode={'thumbnails'}/>
                    <SidebarBlock name={"Vertical File List"} type={BlockType.FileList} mode={'list'}/>
                    <SidebarBlock name={"Text Paragraph"} type={BlockType.Text}/>
                    <SidebarBlock name={"Footer"} type={BlockType.Footer}/>
                </div>
            </div>
        )
    }
}