import React, { Component, PropTypes } from 'react';
import { DragSource, DropTarget } from 'react-dnd';
import Types from './DNDType.js';
import classes from 'classnames';

const draggableBlockSource = {
    beginDrag(props) {
        return {
            id: props.id
        };
    }
};

const draggableBlockTarget = {
    canDrop(props, monitor) {
        const item = monitor.getItem();
        return true;
    },

    hover(props, monitor, component) {
        var draggedId = monitor.getItem().id;
        if (draggedId !== props.id) {
            // props.moveBlock(draggedId,props.id);
        }
    },
    drop(props, monitor, component) {
        if (monitor.didDrop()) {
            return;
        }

        return;

        var draggedId = monitor.getItem().id;
        if (draggedId !== props.id) {
            props.moveBlock(draggedId,props.id);
        }

        return { moved: true };
    }
};


@DropTarget([Types.Block], draggableBlockTarget, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    isOverCurrent: monitor.isOver({ shallow: true }),
    canDrop: monitor.canDrop(),
    itemType: monitor.getItemType(),
    clientOffset: monitor.getClientOffset()
}))
@DragSource(Types.Block, draggableBlockSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging()
}))
export default class DraggableBlock extends Component {
    constructor(props) {
        super(props);
    }

    handleRemove(){
        if(this.props.onRemove) {
            this.props.onRemove();
        }
    }

    handleFitOption() {
        if(this.props.onThumbOptionChange) {
            this.props.onThumbOptionChange({
                id: this.props.id,
                mode: 'fit'
            });
        }
    }

    handleFillOption() {
        if(this.props.onThumbOptionChange) {
            this.props.onThumbOptionChange({
                id: this.props.id,
                mode: 'fill'
            });
        }
    }

    render() {
        if(this.props.viewMode !== 'editor') {
            return (
                <div>
                    {this.props.children}
                </div>
            )
        }

        const { isOver, canDrop, connectDropTarget, thumbnailsMode, isOverCurrent, isDragging, connectDragSource, clientOffset, connectDragPreview, showLeftControls} = this.props;

        var controlsStyle = {
            display: isOver || isDragging || isOverCurrent ? "none" : ""
        };

        var separatorStyle = {
            display: isOver ? "block" : "none",
            height: 20,
            backgroundColor: "#fd9966"
        };

        return connectDragPreview(
            <div className="draggable-block">
                <div className="side-background"></div>
                <div className="controls-bar" style={controlsStyle}>
                    {connectDragSource(<div id={this.props.id} className="drag-block"></div>)}
                    <div className="remove-block" onClick={this.handleRemove.bind(this)}></div>
                </div>
                {showLeftControls ? (<div className="left-controls-bar" style={controlsStyle}>
                    <div className={classes("option",thumbnailsMode !== 'fit' ? 'active' : '')} onClick={this.handleFillOption.bind(this)}>Fill</div>
                    <div className={classes("option",thumbnailsMode === 'fit' ? 'active' : '')} onClick={this.handleFitOption.bind(this)}>Fit</div>
                </div>) : null}
                <div style={separatorStyle}></div>
                {this.props.children}
            </div>
        )
    }
}