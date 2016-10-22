import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import Uuid from 'uuid';
import { DropTarget } from 'react-dnd';
import update from 'react/lib/update';
import classes from 'classnames';
import _ from 'lodash';

import BlockType from 'components/BlockType.js';
import { defaultDataForBlockType } from 'common';
import BendUtils from 'common/bend-utils.js';

import Types from 'components/DNDType.js';

import NavigationBar from 'components/NavigationBar.js';
import Canvas from 'containers/Canvas';
import Sidebar from 'components/Sidebar';
import LoadingIndicator from 'components/LoadingIndicator';

const extendedDropZoneTarget = {
  canDrop(props, monitor) {
    const item = monitor.getItem();
    return true;
  },

  hover(props, monitor, component) {
    const clientOffset = monitor.getClientOffset();
    const componentRect = ReactDOM.findDOMNode(component).getBoundingClientRect();
    const isJustOverThisOne = monitor.isOver({ shallow: true });
    const canDrop = monitor.canDrop();

    console.log('IsHovering??');
  },

  drop(props, monitor, component) {
    if (monitor.didDrop()) {
      return;
    }

    const itemType = monitor.getItemType();
    const item = monitor.getItem();

    if (itemType ===  Types.BlockPreset) {
      component.insertBlockAfter({
        id: Uuid.v4(),
        type: item.type,
        mode: item.mode,
        data: defaultDataForBlockType(item.type),
      });
    }

    return { moved: false };
  },
};

@DropTarget([Types.BlockPreset], extendedDropZoneTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  isOverCurrent: monitor.isOver({ shallow: true }),
  canDrop: monitor.canDrop(),
  itemType: monitor.getItemType()
}))
export default class AppWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pad: {
        blocks: [],
      },
      isInitializing: true,
      viewMode: 'editor',
    };
  }

  componentDidMount() {
    console.log('LOGGING ROUTER:');
    console.log(this.props.padID);

    // Dev: 55ae3f4b4bad30379700e345
    // Prod: 55a32ab04bad3037970043e5

    // var id = _.last(this.props.location.pathname.split('/'));
    var id = this.props.padID;
    console.log(id);
    this.fetchPad(id, (err, pad) => {
      if (err) {
        console.log('Error while fetching file pad!');
        console.log(err);

        this.setState({
          isInitializing: false,
        });
        return;
      }

      this.setState({
        isInitializing: false,
        pad: pad,
      });
    });

    this.saveCurrentPadDebounced = _.debounce(this.saveCurrentPad, 1000);
  }

  fetchPad(id, callback) {
    BendUtils.wrapInCallback(Bend.DataStore.get('pad', id), callback);
  }

  saveCurrentPad(callback) {
    callback = callback || function () {};

    this.setState({
      isSaving: true,
    });

    this.savePad(this.state.pad, (err, res) => {
      this.setState({
        isSaving: false,
      });

      if (err) {
        callback(err);
        return;
      }

      callback(null, res);
    });
  }

  savePad(pad, callback) {
    pad = _.clone(pad, true);
    _.each(
      _(pad.blocks).filter((block) => (block.type === BlockType.FileList)).value(),
      (block) => {
        if (_.get(block, 'data.files')) {
          block.data.files = _.map(block.data.files,
                                   (file) => (_.omit(file, 'uploader', 'blob')));
        }
      });

    BendUtils.wrapInCallback(Bend.DataStore.save('pad', pad), callback);
  }

  onBlockAdd(block) {
    this.setState({
      pad: _.extend(this.state.pad, {
        blocks: this.state.pad.blocks.concat(block),
      }),
    });

    this.saveCurrentPad();
  }

  onBlockRemove(id) {
    this.setState({
      pad: _.extend(this.state.pad, {
        blocks: _.filter(this.state.pad.blocks, (block) => (block.id !== id)),
      }),
    });

    this.saveCurrentPad();
  }

  moveBlock(id, afterId) {
    const { pad } = this.state;
    return;

    var blocks = pad.blocks;

    const block = blocks.filter(f => f.id === id)[0];
    const afterBlock = blocks.filter(f => f.id === afterId)[0];
    const blockIndex = blocks.indexOf(block);
    const afterIndex = blocks.indexOf(afterBlock);
    this.setState(update(this.state, {
      pad: {
        blocks: {
          $splice: [
            [blockIndex, 1],
            [afterIndex, 0, block],
          ],
        },
      },
    }));

    this.saveCurrentPad();
  }

    moveBlockBefore(id, beforeID) {
      if (id === beforeID) {
        return;
      }

      const { pad } = this.state;
      const blocks = _.clone(pad.blocks, true);

      const blockIndex = _.findIndex(blocks, (block) => id === block.id);
      var block = _.first(_.pullAt(blocks, blockIndex));
      const beforeIndex = _.findIndex(blocks, (block) => beforeID === block.id);
      blocks.splice(beforeIndex, 0, block);

      this.setState(_.extend(pad, {
        blocks: blocks,
      }));

      this.saveCurrentPad();
    }

    moveBlockAfter(id, afterID) {
      if (id === afterID) {
        return;
      }

      const { pad } = this.state;
      const blocks = pad.blocks;

      const blockIndex = _.findIndex(blocks, (block) => id === block.id);
      var block = _.first(_.pullAt(blocks, blockIndex));
      const afterIndex = _.findIndex(blocks, (block) => afterID === block.id);
      blocks.splice(afterIndex + 1, 0, block);

      this.saveCurrentPad();
    }

    insertBlockBefore(block, index) {
      var blocks = this.state.pad.blocks;
      blocks.splice(index, 0, block);

      this.setState({
        pad: _.extend(this.state.pad, {
          blocks: blocks,
        }),
      });

      this.saveCurrentPad();
    }

    insertBlockAfter(block, index) {
      if (index !== 0) {
        index = index || this.state.pad.blocks.length;
      }

      var blocks = _.clone(this.state.pad.blocks, true);
      blocks.splice(index + 1, 0, block);

      this.setState({
        pad: _.extend(this.state.pad, {
          blocks: blocks,
        }),
      });

      this.saveCurrentPad();
    }

    blockDidChange(id, data) {
      const { pad } = this.state;

      var index = _.findIndex(pad.blocks, (block) => block.id === id);
      if (index != -1) {
        pad.blocks[index] = _.extend(pad.blocks[index], {
          data: data,
        });

        this.setState({
          pad: pad,
        });

        this.saveCurrentPadDebounced();
      }
    }

    handleViewModeChange(newViewMode) {
      this.setState({
        viewMode: newViewMode,
      });
    }

    hasBlocks() {
      return this.state.pad.blocks.length;
    }

    renderExtendedDropZone() {
      const { isOver, connectDropTarget } = this.props;
      const { viewMode, isInitializing } = this.state;

      return (this.hasBlocks() && !isInitializing && viewMode === 'editor')
          ? connectDropTarget(
              <div className={classes('extended-drop-zone', isOver ? 'active' : '')}>
                <div className="separator"/>
              </div>)
          : null;
    }

    render() {
      const { isOver, connectDropTarget } = this.props;
      const { pad, isSaving, viewMode, isInitializing } = this.state;

      return (
        <div>
          <div>
            {this.renderExtendedDropZone()}
            {viewMode === 'editor' ? (<Sidebar/>) : null}
            <Canvas blocks={pad.blocks}
                    onBlockAdd={this.onBlockAdd.bind(this)}
                    onBlockRemove={this.onBlockRemove.bind(this)}
                    moveBlock={this.moveBlock.bind(this)}
                    onBlockChange={this.blockDidChange.bind(this)}
                    isSaving={isSaving}
                    isInitializing={isInitializing}
                    viewMode={viewMode}
                    insertBlockBefore={this.insertBlockBefore.bind(this)}
                    insertBlockAfter={this.insertBlockAfter.bind(this)}
                    moveBlockBefore={this.moveBlockBefore.bind(this)}
                    moveBlockAfter={this.moveBlockAfter.bind(this)}
                />
            { isSaving
              ? (<div className="saving-indicator">
                  <LoadingIndicator visible={true}/>
                </div>)
              : null }

            <div className="extended-drop-zone-container">
              <div className={classes('extended-drop-zone-separator',
                                      isOver ? 'active'
                                             : '')}>
              </div>
              <div style={{ marginBottom:30 }} />
            </div>
            <NavigationBar
              viewMode={viewMode}
              name={pad.name}
              onViewModeChange={this.handleViewModeChange.bind(this)} />
          </div>
        </div>
      );
    }
}
