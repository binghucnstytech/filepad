import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { DropTarget } from 'react-dnd';
import classes from 'classnames';

import BlockType from 'components/BlockType.js';
import Types from 'components/DNDType.js';

import DropZoneBar from 'containers/DropZoneBar';

import DraggableBlock from 'components/DraggableBlock.js';
import BaseBlock from 'components/BaseBlock.js';
import TextBlock from 'components/TextBlock.js';
import FooterBlock from 'components/FooterBlock.js';
import SingleFileBlock from 'components/SingleFileBlock.js';
import TwoFilesBlock from 'components/TowFilesBlock.js';
import TitleBlock from 'components/TitleBlock.js';
import SubtitleBlock from 'components/SubtitleBlock.js';
import FilesBlock from 'components/FilesBlock.js';

import LoadingIndicator from 'components/LoadingIndicator';

const canvasTarget = {
  canDrop(props, monitor) {
    const item = monitor.getItem();
    return true;
  },

  hover(props, monitor, component) {
    const clientOffset = monitor.getClientOffset();
    const componentRect = ReactDOM.findDOMNode(component).getBoundingClientRect();
    const isJustOverThisOne = monitor.isOver({ shallow: true });
    const canDrop = monitor.canDrop();

    /*
    console.log(clientOffset);

    if(clientOffset.y>800) {
        if(!scrollingInterval) {
            scrollingInterval = window.setInterval(function(){
                window.scrollTo(0, window.pageYOffset+15);
            },1);

        } else {

        }
    } else {
        window.clearInterval(scrollingInterval);
        scrollingInterval=null;
    }
    */
  },

  drop(props, monitor, component) {
    if (monitor.didDrop()) {
      return;
    }

    console.log('Has blocks:');
    console.log(component.hasBlocks());

    const item = monitor.getItem();
    if (item.type && !component.hasBlocks()) {
      component.addBlock({
        id: Guid.raw(),
        type: item.type,
        mode: item.mode,
        data: defaultDataForBlockType(item.type),
      });
    }

    return { moved: true };
  },
};

@DropTarget([Types.BlockPreset, Types.Block], canvasTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  isOverCurrent: monitor.isOver({ shallow: true }),
  canDrop: monitor.canDrop(),
  itemType: monitor.getItemType(),
}))
export default class Canvas extends Component {
  static propTypes = {
    viewMode: React.PropTypes.string,
    blocks: PropTypes.array,
  };

  static defaultProps = {
    viewMode: 'editor',
    blocks: [],
  };

  constructor(props) {
    super(props);

    this.state = {
      blocks: [],
    };
  }

  componentWillReceiveProps(nextProps) {
    this.state = {
      blocks: nextProps.blocks,
    };
  }

  moveBlock(id, afterId) {
    if (this.props.moveBlock) {
      this.props.moveBlock(id, afterId);
    }
  }

  moveBlockBefore(id, afterId) {
    if (this.props.moveBlock) {
      this.props.moveBlock(id, afterId);
    }
  }

  moveBlockAfter(id, afterId) {
    if (this.props.moveBlock) {
      this.props.moveBlock(id, afterId);
    }
  }

  addBlock(block) {
    if (this.props.onBlockAdd) {
      this.props.onBlockAdd(block);
    }
  }

  insertBlockBefore(block, index) {
    if (this.props.insertBlockBefore) {
      this.props.insertBlockBefore(block, index);
    }
  }

  insertBlockAfter(block, index) {
    if (this.props.insertBlockAfter) {
      this.props.insertBlockAfter(block, index);
    }
  }

  hasBlocks() {
    return this.state.blocks.length > 0;
  }

  blockFactory(block) {
    const { id, type, data, mode } = block;

    var viewMode = this.props.viewMode;
    switch (type) {
      case BlockType.FileList:
        return (
          <FilesBlock
            thumbnailsMode={data.thumbnailsMode}
            viewMode={viewMode}
            mode={mode}
            data={data}
            id={id}
            onChange={this.onBlockDidChange.bind(this)}
          />
        );
        break;

      case BlockType.Text:
        return (
          <TextBlock
            viewMode={viewMode}
            needFocus={data.justAdded}
            data={data}
            id={id}
            onChange={this.onBlockDidChange.bind(this)}
          />
        );
        break;

      case BlockType.Title:
        return (
          <TitleBlock
            viewMode={viewMode}
            needFocus={data.justAdded}
            id={id}
            data={data}
            onChange={this.onBlockDidChange.bind(this)}
          />
        );
        break;

      case BlockType.Subtitle:
        return (
          <SubtitleBlock
            viewMode={viewMode}
            needFocus={data.justAdded}
            id={id}
            data={data}
            onChange={this.onBlockDidChange.bind(this)}
          />
        );
        break;

      case BlockType.Footer:
        return (
          <FooterBlock
            viewMode={viewMode}
            needFocus={data.justAdded}
            id={id}
            data={data}
            onChange={this.onBlockDidChange.bind(this)}
          />
        );
        break;

      case BlockType.SingleFile:
        return (
          <SingleFileBlock
            viewMode={viewMode}
            id={id}
            data={data}
            onChange={this.onBlockDidChange.bind(this)}
          />
        );
        break;

      case BlockType.TwoFiles:
        return (
          <TwoFilesBlock
            viewMode={viewMode}
            id={id}
            data={data}
            onChange={this.onBlockDidChange.bind(this)}
          />
        );
        break;
    }
  }

  onBlockRemove(block) {
    if (this.props.onBlockRemove) {
      this.props.onBlockRemove(block.id);
    }
  }

  onBlockDidChange(id, data) {
    if (this.props.onBlockChange) {
      this.props.onBlockChange(id, data);
    }
  }

  onThumbOptionChange(option) {
    var block = _.find(this.state.blocks, (block) => block.id === option.id);
    if (block) {
      var data = _.clone(block.data, true);
      data.thumbnailsMode = option.mode;
      this.onBlockDidChange(block.id, data);
    }
  }

  renderBlocks(showDropZones) {
    const { isOver, canDrop, connectDropTarget, viewMode, isSaving } = this.props;
    const { blocks } = this.state;

    return _.map(blocks, (block, index) => {
      const showLeftControls = block.type === BlockType.FileList && block.mode === 'thumbnails';
      return (
        <div className="block-container" key={block.id}>
          <DraggableBlock thumbnailsMode={block.data.thumbnailsMode}
                          onThumbOptionChange={this.onThumbOptionChange.bind(this)}
                          showLeftControls={showLeftControls}
                          viewMode={viewMode}
                          key={block.id}
                          id={block.id}
                          moveBlock={this.moveBlock.bind(this)}
                          onRemove={this.onBlockRemove.bind(this, block)}>
              {this.blockFactory(block)}
          </DraggableBlock>
          <DropZoneBar blockID={block.id} index={index} visible={isOver} isTop={true}
                       insertBlock={this.insertBlockBefore.bind(this)}
                       moveBlock={this.props.moveBlockBefore.bind(this)}/>
          <DropZoneBar blockID={block.id} index={index} visible={isOver} isTop={false}
                       insertBlock={this.insertBlockAfter.bind(this)}
                       moveBlock={this.props.moveBlockAfter.bind(this)}/>
        </div>
      );
    }, this);
  }

  renderInitializing() {
    return (
      <div className="canvas-container">
        <div className="canvas">
          <div className="initializing-box">
            <LoadingIndicator visible={true}/>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { isOver, canDrop, connectDropTarget, viewMode, isSaving, isInitializing } = this.props;
    const { blocks } = this.state;

    if (isInitializing) {
      return this.renderInitializing();
    }

    if (viewMode !== 'editor') {
      return (
        <div className="canvas-container" style={{ marginLeft:0 }}>
          <div className={classes('canvas', viewMode === 'preview' ? 'preview-mode' : '')}>
            {this.renderBlocks(false)}
          </div>
        </div>
      );
    }

    return connectDropTarget(
      <div className="canvas-container">
        <div className={classes('canvas', viewMode === 'preview' ? 'preview-mode' : '')}>
          {this.renderBlocks(isOver)}
          {!this.hasBlocks() ?
            (
              <div className={classes('drop-zone', isOver ? 'active' : '')}>
                <h1>{ !isOver ? 'Drag & drop blocks here...' : 'Drop It!!!'}</h1>
              </div>
            ) : null
          }
        </div>
      </div>
    );
  }
}
