
import '../styles/main.scss';
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';

import { Router, Route, Link, hashHistory } from 'react-router';

import update from 'react/lib/update';
import _ from 'lodash';
import ContentEditable from './components/content-editable.js'

var HTML5Backend = require('react-dnd/modules/backends/HTML5');
import { DragDropContext } from 'react-dnd';
import { DragSource, DropTarget } from 'react-dnd';

import Guid from 'guid';
import Types from './components/DNDType.js';
import BlockType from './components/BlockType.js';

import Sidebar from './components/Sidebar.js';
import NavigationBar from './components/NavigationBar.js';

import DraggableBlock from './components/DraggableBlock.js';
import BaseBlock from './components/BaseBlock.js';
import TextBlock from './components/TextBlock.js';
import FooterBlock from './components/FooterBlock.js';
import SingleFileBlock from './components/SingleFileBlock.js';
import TwoFilesBlock from './components/TowFilesBlock.js';
import TitleBlock from './components/TitleBlock.js';
import SubtitleBlock from './components/SubtitleBlock.js';
import FilesBlock from './components/FilesBlock.js';

import LoadingIndicator from './components/LoadingIndicator.js';

var classes=require('classnames');
import BendUtils from './common/bend-utils.js'

import { upload } from './common/bend-uploader.js';


function defaultDataForBlockType(type) {
    switch(type) {
        case BlockType.Footer: {
            return {
                text: "Page footer",
                justAdded: true
            }
        }
        case BlockType.LargeImage: {
            return {
                file: {}
            }
        }
        case BlockType.SingleFile: {
            return {
                title: "Title",
                hasDescription: false,
                description: "Description",
                file: {}
            }
        }
        case BlockType.TwoFiles: {
            return {
                dataA: {
                    title: "Title",
                    hasDescription: false,
                    description: "Description",
                    file: {}
                },
                dataB: {
                    title: "Title",
                    hasDescription: false,
                    description: "Description",
                    file: {}
                }
            }
        }
        case BlockType.FileList: {
            return {
                thumbnailsMode: 'fill',
                files: []
            }
        }
        case BlockType.Text:
            return {
                text: "Text Paragraph",
                justAdded: true
            }

        case BlockType.Title:
            return {
                text: "Page Header",
                justAdded: true
            }

        case BlockType.Subtitle:
            return {
                text: "Section Header",
                justAdded: true
            }
    }
}

var scrollingInterval = null;

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

        console.log("Has blocks:");
        console.log(component.hasBlocks());

        const item = monitor.getItem();
        if(item.type && !component.hasBlocks()) {
            component.addBlock({
                id: Guid.raw(),
                type: item.type,
                mode: item.mode,
                data: defaultDataForBlockType(item.type)
            })
        }

        return { moved: true };
    }
};

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

        switch(itemType) {
            case Types.BlockPreset: {
                component.props.insertBlock({
                    id: Guid.raw(),
                    type: item.type,
                    mode: item.mode,
                    data: defaultDataForBlockType(item.type)
                },component.props.index);

                return { moved: true };
            } break;

            case Types.Block: {
                console.log("Item:");
                console.log(item);
                console.log("Properties:");
                console.log(props);
                props.moveBlock(item.id,props.blockID);
                return { moved: true };
            } break;
        }

        return { moved: false };
    }
};

@DropTarget([Types.BlockPreset,Types.Block], dropZoneTarget, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    isOverCurrent: monitor.isOver({ shallow: true }),
    canDrop: monitor.canDrop(),
    itemType: monitor.getItemType()
}))
class DropZoneBar extends Component {
    static propTypes = {
        addBlock: PropTypes.func
    };

    render() {
        const { visible, isTop, isOver, canDrop, connectDropTarget, debug } = this.props;
        var style={
            display: visible ? 'block' : 'none'
        };

        return connectDropTarget(
             <div className={ isTop ? classes('drop-placeholder-top',debug ? 'debug' : '') : classes('drop-placeholder-bottom',debug ? 'debug' : '')} style={style}>
                 <div className="separator" style={{ display: isOver ? 'block' : 'none' }}></div>
             </div>
        );
    }
}


@DropTarget([Types.BlockPreset,Types.Block], canvasTarget, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    isOverCurrent: monitor.isOver({ shallow: true }),
    canDrop: monitor.canDrop(),
    itemType: monitor.getItemType()
}))
class Canvas extends Component {
    static propTypes = {
        viewMode: React.PropTypes.string,
        blocks: PropTypes.array
    };

    static defaultProps = {
        viewMode: 'editor',
        blocks: []
    };

    constructor(props) {
        super(props);

        this.state = {
            blocks: []
        };
    }

    componentWillReceiveProps(nextProps) {
        this.state = {
            blocks: nextProps.blocks
        };
    }

    componentDidMount() {
    }

    moveBlock(id, afterId) {
        if(this.props.moveBlock){
            this.props.moveBlock(id,afterId);
        }
    }

    moveBlockBefore(id, afterId) {
        if(this.props.moveBlock){
            this.props.moveBlock(id,afterId);
        }
    }

    moveBlockAfter(id, afterId) {
        if(this.props.moveBlock){
            this.props.moveBlock(id,afterId);
        }
    }

    addBlock(block) {
        if(this.props.onBlockAdd) {
            this.props.onBlockAdd(block);
        }
    }

    insertBlockBefore(block,index) {
        if(this.props.insertBlockBefore) {
            this.props.insertBlockBefore(block,index);
        }
    }

    insertBlockAfter(block,index) {
        if(this.props.insertBlockAfter) {
            this.props.insertBlockAfter(block,index);
        }
    }

    hasBlocks() {
        return this.state.blocks.length > 0;
    }

    blockFactory(block) {
        const { id, type, data, mode } = block;

        var viewMode = this.props.viewMode;
        switch(type) {
            case BlockType.FileList:
                return (<FilesBlock thumbnailsMode={data.thumbnailsMode} viewMode={viewMode} mode={mode} data={data} id={id} onChange={this.onBlockDidChange.bind(this)}/>)
                break;
            case BlockType.Text:
                return (<TextBlock viewMode={viewMode} needFocus={data.justAdded} data={data} id={id} onChange={this.onBlockDidChange.bind(this)}/>)
                break;
            case BlockType.Title:
                return (<TitleBlock viewMode={viewMode} needFocus={data.justAdded} id={id} data={data} onChange={this.onBlockDidChange.bind(this)}/>)
                break;
            case BlockType.Subtitle:
                return (<SubtitleBlock viewMode={viewMode} needFocus={data.justAdded} id={id} data={data} onChange={this.onBlockDidChange.bind(this)}/>)
                break;
            case BlockType.Footer:
                return (<FooterBlock viewMode={viewMode} needFocus={data.justAdded} id={id} data={data} onChange={this.onBlockDidChange.bind(this)}/>)
                break;
            case BlockType.SingleFile:
                return (<SingleFileBlock viewMode={viewMode} id={id} data={data} onChange={this.onBlockDidChange.bind(this)}/>)
                break;
            case BlockType.TwoFiles:
                return (<TwoFilesBlock viewMode={viewMode} id={id} data={data} onChange={this.onBlockDidChange.bind(this)}/>)
                break;
        }
    }

    onBlockRemove(block) {
        if(this.props.onBlockRemove) {
            this.props.onBlockRemove(block.id);
        }
    }

    onBlockDidChange(id,data) {
        if(this.props.onBlockChange) {
            this.props.onBlockChange(id,data);
        }
    }

    onThumbOptionChange(option) {
        var block = _.find(this.state.blocks,(block) => block.id === option.id);
        if(block) {
            var data = _.clone(block.data,true);
            data.thumbnailsMode = option.mode;
            this.onBlockDidChange(block.id,data);
        }
    }

    renderBlocks(showDropZones) {
        const { isOver, canDrop, connectDropTarget,viewMode, isSaving } = this.props;
        const { blocks } = this.state;

        return _.map(blocks,(block,index) => {
            const showLeftControls = block.type === BlockType.FileList && block.mode === 'thumbnails';
            return (
                <div className="block-container" key={block.id}>
                    <DraggableBlock thumbnailsMode={block.data.thumbnailsMode} onThumbOptionChange={this.onThumbOptionChange.bind(this)} showLeftControls={showLeftControls} viewMode={viewMode} key={block.id} id={block.id} moveBlock={this.moveBlock.bind(this)} onRemove={this.onBlockRemove.bind(this,block)}>
                        {this.blockFactory(block)}
                    </DraggableBlock>
                    <DropZoneBar blockID={block.id} index={index} visible={isOver} isTop={true}
                                 insertBlock={this.insertBlockBefore.bind(this)}
                                 moveBlock={this.props.moveBlockBefore.bind(this)}/>
                    <DropZoneBar blockID={block.id} index={index} visible={isOver} isTop={false}
                                 insertBlock={this.insertBlockAfter.bind(this)}
                                 moveBlock={this.props.moveBlockAfter.bind(this)}/>
                </div>
            )
        },this)
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
        const { isOver, canDrop, connectDropTarget,viewMode, isSaving, isInitializing } = this.props;
        const { blocks } = this.state;

        if(isInitializing) {
            return this.renderInitializing();
        }

        if(viewMode!== 'editor') {
            return (
                <div className="canvas-container" style={{marginLeft:0}}>
                    <div className={classes("canvas",viewMode === 'preview' ? 'preview-mode' : '')}>
                        {this.renderBlocks(false)}
                    </div>
                </div>
            )
        }

        return connectDropTarget(
            <div className="canvas-container">
                <div className={classes("canvas",viewMode === 'preview' ? 'preview-mode' : '')}>
                    {this.renderBlocks(isOver)}
                    {!this.hasBlocks() ? (<div className={classes('drop-zone',isOver ? 'active' : '')}>
                            <h1>{ !isOver ? 'Drag & drop blocks here...' : 'Drop It!!!'}</h1>
                        </div>) : null
                    }
                </div>
            </div>
        )
    }
}


class SaveIndicator extends Component {
    static propTypes = {
        visible: PropTypes.bool
    };

    static defaultProps = {
        visible: false
    };

    constructor(props) {
        super(props);
    }

    render() {
        const { visible } = this.props;
        var style={
            display: visible ? "block" : "none",
            textAlign: "right"
        };
        return (
            <div style={style}>Saving...</div>
        );
    }
}

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

        console.log("IsHovering??");
    },

    drop(props, monitor, component) {
        if (monitor.didDrop()) {
            return;
        }

        const itemType = monitor.getItemType();
        const item = monitor.getItem();

        if(itemType ===  Types.BlockPreset) {
            component.insertBlockAfter({
                id: Guid.raw(),
                type: item.type,
                mode: item.mode,
                data: defaultDataForBlockType(item.type)
            });
        }

        return { moved: false };
    }
};


@DropTarget([Types.BlockPreset], extendedDropZoneTarget, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    isOverCurrent: monitor.isOver({ shallow: true }),
    canDrop: monitor.canDrop(),
    itemType: monitor.getItemType()
}))
class AppWrapper extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pad: {
                blocks: []
            },
            isInitializing: true,
            viewMode: 'editor'
        };
    }

    componentDidMount() {
        console.log("LOGGING ROUTER:");
        console.log(this.props.location);


        // Dev: 55ae3f4b4bad30379700e345
        // Prod: 55a32ab04bad3037970043e5

        var id = _.last(this.props.location.pathname.split('/'));
        console.log(id);
        this.fetchPad(id,(err,pad) => {
            if(err) {
                console.log("Error while fetching file pad!");
                console.log(err);

                this.setState({
                    isInitializing: false
                })
                return;
            }

            this.setState({
                isInitializing: false,
                pad: pad
            });
        });

        this.saveCurrentPadDebounced = _.debounce(this.saveCurrentPad,1000);
    }

    fetchPad(id,callback) {
        BendUtils.wrapInCallback(Bend.DataStore.get("pad",id),callback);
    }

    saveCurrentPad(callback) {
        callback = callback || function() {};
        this.setState({
            isSaving: true
        });

        this.savePad(this.state.pad,(err,res) => {
            this.setState({
                isSaving: false
            });

            if(err) {
                callback(err);
                return;
            }

            callback(null,res);
        });
    }

    savePad(pad,callback) {
        pad = _.clone(pad,true);
        _.each(_(pad.blocks).filter((block) => { return block.type === BlockType.FileList }).value(),(block) => {
            if(_.get(block,"data.files")){
                block.data.files = _.map(block.data.files,(file) => {
                   return _.omit(file,"uploader","blob");
                });
            }
        });
        BendUtils.wrapInCallback(Bend.DataStore.save("pad",pad),callback);
    }

    onBlockAdd(block) {
        this.setState({
            pad: _.extend(this.state.pad,{
                blocks: this.state.pad.blocks.concat(block)
            })
        });

        this.saveCurrentPad();
    }

    onBlockRemove(id) {
        this.setState({
            pad: _.extend(this.state.pad,{
                blocks: _.filter(this.state.pad.blocks,(block) => { return block.id !== id; })
            })
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
                         [afterIndex, 0, block]
                     ]
                 }
             }
             }
         ));

        this.saveCurrentPad();
    }

    moveBlockBefore(id, beforeID) {
        if(id === beforeID) {
            return;
        }


        const { pad } = this.state;
        const blocks = _.clone(pad.blocks,true);

        const blockIndex = _.findIndex(blocks,(block) => id === block.id);
        var block = _.first(_.pullAt(blocks,blockIndex));
        const beforeIndex = _.findIndex(blocks,(block) => beforeID === block.id);
        blocks.splice(beforeIndex,0,block);

        this.setState(_.extend(pad,{
            blocks: blocks
        }));

        this.saveCurrentPad();
    }

    moveBlockAfter(id, afterID) {
        if(id === afterID) {
            return;
        }

        const { pad } = this.state;
        const blocks = pad.blocks;

        const blockIndex = _.findIndex(blocks,(block) => id === block.id);
        var block = _.first(_.pullAt(blocks,blockIndex));
        const afterIndex = _.findIndex(blocks,(block) => afterID === block.id);
        blocks.splice(afterIndex+1,0,block);

        this.saveCurrentPad();
    }

    insertBlockBefore(block,index) {
        var blocks = this.state.pad.blocks;
        blocks.splice(index,0,block);

        this.setState({
            pad: _.extend(this.state.pad,{
                blocks: blocks
            })
        });

        this.saveCurrentPad();
    }

    insertBlockAfter(block,index) {
        if(index !== 0) {
            index = index || this.state.pad.blocks.length;
        }

        var blocks = _.clone(this.state.pad.blocks,true);
        blocks.splice(index+1,0,block);

        this.setState({
            pad: _.extend(this.state.pad,{
                blocks: blocks
            })
        });

        this.saveCurrentPad();
    }

    blockDidChange(id,data) {
        const { pad } = this.state;

        var index = _.findIndex(pad.blocks,(block) => { return block.id === id });
        if(index!=-1) {

            pad.blocks[index] = _.extend(pad.blocks[index],{
                data: data
            });

            this.setState({
                pad: pad
            });

            this.saveCurrentPadDebounced();
        }
    }

    handleViewModeChange(newViewMode) {
        this.setState({
            viewMode: newViewMode
        });
    }

    hasBlocks() {
        return this.state.pad.blocks.length;
    }

    renderExtendedDropZone() {
        const { isOver, connectDropTarget } = this.props;
        const { viewMode, isInitializing } = this.state;

        return (this.hasBlocks() && !isInitializing && viewMode === 'editor') ? connectDropTarget(<div className={classes('extended-drop-zone',isOver ? 'active' : '')}><div className="separator"/></div>)  : null
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
                    { isSaving ? (<div className="saving-indicator">
                        <LoadingIndicator visible={true}/>
                    </div>) : null }
                    <div className="extended-drop-zone-container">
                        <div className={classes('extended-drop-zone-separator',isOver ? 'active' : '')}></div>
                        <div style={{marginBottom:30}}/>
                    </div>
                    <NavigationBar viewMode={viewMode} name={pad.name} onViewModeChange={this.handleViewModeChange.bind(this)}/>
                </div>
            </div>
        );
    }
}




var AppRouter = React.createClass({
    contextTypes: {
        router: React.PropTypes.func
    },
    render() {
        return (<AppWrapper location={this.props.location}/>);
    }
});

@DragDropContext(HTML5Backend)
class App extends Component {
    render() {
        return (<AppRouter location={this.props.location}/>);
    }
}



function initBend(callback) {
    callback = callback || function() {};

    var appKey = "55a327c84bad3037970043b5";
    var appSecret = "zF6GQ4J3Bo9wbVBfZyF6gZ9muL3b63VByzNo551R";
    if(localStorage) {
        localStorage.removeItem(`Bend.${appKey}.activeUser`);
    }

    BendUtils.wrapInCallback(Bend.init({
        appKey: appKey,
        appSecret: appSecret
    }),function(err,activeUser){
        if(err) {
            callback(err);
            return;
        }

        if(!Bend.getActiveUser()) {
            BendUtils.wrapInCallback(Bend.User.login({
                username: "admin",
                password: "admin123"
            }),function(err,res){
                if(err) {
                    callback(err);
                    return;
                }

                callback(null,res);
            });
        } else {
            callback(null,Bend.getActiveUser());
        }
    });
}


import AppEx from './containers/App.js';
import Dashboard from './views/Dashboard.js';


document.addEventListener("DOMContentLoaded", () => {
  initBend(function(err){
      if(err) {
          console.log("Error while initializing bend!");
          console.log(err);
          return;
      }

      var routes =  (
          <Router history={hashHistory}>
              <Route path="/" component={Dashboard}/>
              <Route path="/pad/:padID" component={App}/>
          </Router>
      );

      ReactDOM.render(routes, document.querySelector('#content'));

      // React.render(<App />, document.querySelector('#content'));
      // React.render(<Dashboard />, document.querySelector('#content'));
      // React.render(<AppEx />, document.querySelector('#content'));
      // React.render(<UploaderApp/>, document.querySelector('#content'));
  });

});
