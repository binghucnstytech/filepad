import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { defaultDataForBlockType } from 'common';
import { DropTarget } from 'react-dnd';
import Types from 'components/DNDType.js';
import Guid from 'guid';
import classes from 'classnames';

const dropZoneTarget = {
  canDrop(props, monitor) {
    const item = monitor.getItem();
    return true;
  },

  hover(props, monitor, component) {
    const clientOffset = monitor.getClientOffset();
    const componentRect = ReactDOM.findDOMNode(component).getBoundingClientRect();
    const isJustOverThisOne = monitor.isOver({ shallow: true });
    const canDrop = monitor.canDrop();
  },

  drop(props, monitor, component) {
    if (monitor.didDrop()) {
      return;
    }

    const itemType = monitor.getItemType();
    const item = monitor.getItem();

    switch (itemType) {
      case Types.BlockPreset: {
        component.props.insertBlock({
          id: Guid.raw(),
          type: item.type,
          mode: item.mode,
          data: defaultDataForBlockType(item.type),
        }, component.props.index);

        return { moved: true };
      } break;

      case Types.Block: {
        console.log('Item:');
        console.log(item);
        console.log('Properties:');
        console.log(props);
        props.moveBlock(item.id, props.blockID);
        return { moved: true };
      } break;
    }

    return { moved: false };
  },
};

@DropTarget([Types.BlockPreset, Types.Block], dropZoneTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  isOverCurrent: monitor.isOver({ shallow: true }),
  canDrop: monitor.canDrop(),
  itemType: monitor.getItemType()
}))
export default class DropZoneBar extends Component {
  static propTypes = {
    addBlock: PropTypes.func,
  };

  render() {
    const { visible, isTop, isOver, canDrop, connectDropTarget, debug } = this.props;
    var style = {
      display: visible ? 'block' : 'none',
    };

    return connectDropTarget(
     <div
      className={ isTop ? classes('drop-placeholder-top', debug ? 'debug' : '')
                        : classes('drop-placeholder-bottom', debug ? 'debug' : '')}
      style={style}>
       <div className="separator" style={{ display: isOver ? 'block' : 'none' }}></div>
     </div>
    );
  }
}
