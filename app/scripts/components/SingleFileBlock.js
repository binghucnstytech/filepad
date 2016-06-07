import React, { Component, PropTypes } from 'react';
import BaseBlock from './BaseBlock.js'
import ContentEditable from './content-editable.js'
import _ from 'lodash';
import Types from './DNDType.js';
import { DropTarget } from 'react-dnd';
var HTML5Backend = require('react-dnd/modules/backends/HTML5');
import classes from 'classnames';
import { upload } from '../common/bend-uploader.js';
import BendUtils from '../common/bend-utils.js';
import ProgressBar from '../components/ProgressBar.js';


function convertBytes(bytes, precision) {
    var number, units;
    if (bytes === 0 || isNaN(parseFloat(bytes)) || !isFinite(bytes)) {
        return '-';
    }
    if (typeof precision === 'undefined') {
        precision = 1;
    }
    units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'];
    number = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
}

function previewIconClass(filename) {
    if(!filename) {
        return "fmt-default";
    }

    filename = filename.toLowerCase();
    var formats = {
        "fmt-image": ["png","jpg","gif","jpeg","bmp"],
        "fmt-excel": ["xls","xlsx"],
        "fmt-video": ["avi","mov","mp4","m4v"],
        "fmt-word": ["doc","docx"],
        "fmt-pdf": ["pdf"]
    };

    var formatClass="";
    _.each(formats,(fmts,key)=>{
        if(_.any(fmts,(f) => _.endsWith(filename,"."+f))) {
            formatClass = key;
            return false;
        }
    });

    return formatClass || "fmt-default";
}

function supportsPreview(filename) {
    if(!filename) {
        return false;
    }

    return _.any(["png","jpg","gif","jpeg","bmp","pdf"],(f) => _.endsWith(filename.toLowerCase(),"."+f))
}



const fileTarget = {
    canDrop(props, monitor) {
        const item = monitor.getItem();
        return true;
    },

    hover(props, monitor, component) {
        const clientOffset = monitor.getClientOffset();
        const componentRect = React.findDOMNode(component).getBoundingClientRect();
        const isJustOverThisOne = monitor.isOver({ shallow: true });
        const canDrop = monitor.canDrop();
    },

    drop(props, monitor, component) {
        if (monitor.didDrop()) {
            return;
        }

        const item = monitor.getItem();
        component.uploadFile(_.first(item.files));
        return { replaced: true };
    }
};


@DropTarget([HTML5Backend.NativeTypes.FILE], fileTarget, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    isOverCurrent: monitor.isOver({ shallow: true }),
    canDrop: monitor.canDrop(),
    itemType: monitor.getItemType()
}))
export default class SingleFileBlock extends BaseBlock {
    static propTypes = {
        data: React.PropTypes.object
    };

    static defaultProps = {
        data: {
            title: "File title. Click to edit...",
            description: "File description. Click to edit..."
        }
    };

    constructor(props) {
        super(props);
        this.state = {
            blob: {}
        }
    }

    handleDescriptionChange(e) {
        if(this.props.onChange){
            this.props.onChange(this.props.id,_.extend(this.props.data,{
                description: e.target.value
            }));
        }
    }

    handleTitleChange(e) {
        if(this.props.onChange){
            this.props.onChange(this.props.id,_.extend(this.props.data,{
                title: e.target.value
            }));
        }
    }

    notifyChange(blob) {
        if(this.props.onChange){
            this.props.onChange(this.props.id,_.extend(this.props.data,{
                title: blob._filename,
                file: {
                    id: blob._id,
                    filename: blob._filename,
                    filesize: blob.size
                },
                _blob: blob
            }));
        }
    }

    notifyDataChange(obj) {
        if(this.props.onChange){
            this.props.onChange(this.props.id,_.extend(this.props.data,obj));
        }
    }

    uploadFile(file) {
        var that = this;

        this.setState({
            uploader: {
                phase: 'started',
                progress: 0
            }
        });

        upload(file,{
            _public: true,
            _workflow: supportsPreview(file.name) ?  "single-file-thumbnail" : ""
            })
            .on('error',(err) => {
                console.log('error');
                console.log(err);
            })
            .on('completeBlob',(blob) => {
                this.notifyChange(blob);
            })
            .on('uploadProgress',(value) => {
                this.setState({
                    uploader: {
                        phase: 'progress',
                        progress: value
                    }
                });
            })
            .on('completeUpload',(blob) => {
                var query = new Bend.Query();
                query.equalTo("_id",blob._id);
                BendUtils.wrapInCallback(Bend.File.find(query),(err,blobs) => {
                    if(err) {
                        console.log("Error while fetching blobs!");
                        console.log(err);
                        return;
                    }

                    that.setState({
                        uploader: undefined,
                        blob: _.first(blobs)
                    });

                    that.notifyChange(_.first(blobs));
                });
            });
    }

    componentDidMount() {
        var that = this;
        const { data } = this.props;

        if(data.file && data.file.id) {
            var query = new Bend.Query();
            query.equalTo("_id",data.file.id);
            BendUtils.wrapInCallback(Bend.File.find(query),(err,blobs) => {
                if(err) {
                    console.log("Error while fetching blobs!");
                    console.log(err);
                    return;
                }

                that.setState({
                    blob: _.first(blobs)
                });
            });
        }
    }

    enableDescription() {
        this.notifyDataChange({
            hasDescription: true,
            description: "Description"
        });
    }

    disableDescription() {
        this.notifyDataChange({
            hasDescription: false,
            description: "Description"
        });
    }

    renderStatic() {
        const { data,} = this.props;
        // const { blob} = this.state;
        var isEmpty = _.isEmpty(data.file);

        var filename = _.get(data,"file.filename");
        var filesize = _.get(data,"file.filesize");
        var hasPreview = supportsPreview(filename);

        var blob = _.get(data,"_blob");
        var isPreviewReady = _.get(blob,"_downloadURL") && hasPreview;

        var hasDescription = _.get(data,"hasDescription");
        var height = _.get(blob,"_env.input-fit-size.h");

        var previewStyle = {
            backgroundImage: blob && hasPreview ? `url('${_.get(blob,"_versions.thumbnail-fit._downloadURL") || ""}')` : '',
            height: height || 320
        };

        return (
            <div>
                <div className="single-file-block">
                    <div className="title" dangerouslySetInnerHTML={{__html: data.title}}></div>
                        <div className={classes('file-zone',isEmpty ? 'is-empty' : '',hasPreview && isPreviewReady ? '' : 'no-thumbnail')}>
                            <a href={_.get(blob,'_downloadURL')} target="_blank">
                            <div>
                        {isEmpty ? (
                            <div><span className="empty-state">This file block is empty.</span></div>
                        ) :
                            hasPreview && isPreviewReady ? <div className="preview fit-image" style={previewStyle}></div> :
                                (
                                    <div className={classes("preview icon",previewIconClass(filename))}>
                                    </div>
                                )
                        }
                        { !isEmpty ? (<span className="filesize">{convertBytes(filesize)}</span>) : null }
                                </div>
                                <div className="download-overlay"></div>
                            </a>
                        </div>

                    <div className="description-section">
                        { hasDescription ? <div className="description" dangerouslySetInnerHTML={{__html: data.description}}></div> : null}
                    </div>
                </div>
            </div>
        )
    }

    renderEditable() {
        const { data,connectDropTarget, isOver } = this.props;
        const { uploader } = this.state;
        var isEmpty = _.isEmpty(data.file);

        var blob = _.get(data,"_blob");

        const hasDescription = data.hasDescription;

        var isUploading = !_.isUndefined(uploader);
        const progress = isUploading && uploader ? uploader.progress : 0;
        var progressLabel = isUploading && Math.round(progress) === 100 ? "Processing..." : "";

        var filename = _.get(data,"file.filename");
        var filesize = _.get(data,"file.filesize");
        var hasPreview = supportsPreview(filename);
        var isPreviewReady = _.get(blob,"_downloadURL") && hasPreview && !isUploading;

        var height = _.get(blob,"_env.input-fit-size.h");

        var previewStyle = {
            backgroundImage: blob && hasPreview ? `url('${_.get(blob,"_versions.thumbnail-fit._downloadURL") || ""}')` : '',
            height: height || 320
        };

        return connectDropTarget(
            <div>
                <div className="single-file-block">
                    <div className="title"><ContentEditable html={data.title} onChange={this.handleTitleChange.bind(this)}/></div>
                    <div className={classes('file-zone',isEmpty ? 'is-empty' : '',hasPreview && isPreviewReady ? '' : 'no-thumbnail')}>
                        {isEmpty ? (
                            <div><h5 className="empty-state">Drag and drop file here...</h5></div>
                        ) :
                            hasPreview && isPreviewReady ? <div className="preview fit-image" style={previewStyle}></div> :
                                (
                                    <div className={classes("preview icon",previewIconClass(filename))}></div>
                                )
                        }
                        <div className="progress-container" style={{display: isUploading ? 'block' : 'none'}}>
                            <ProgressBar visible={isUploading} progress={progress} showLabel={true} labelText={progressLabel} animate={!_.isEmpty(progressLabel)}/>
                        </div>
                        { !isUploading && !isEmpty ? (<span className="filesize">{convertBytes(filesize)}</span>) : null }
                    </div>
                    <div className="description-section">
                        { hasDescription ? <div className="description"><ContentEditable html={data.description} onChange={this.handleDescriptionChange.bind(this)}/></div> : null}
                        <div className="controls">
                            { !hasDescription  ? <span href="#" onClick={this.enableDescription.bind(this)}>Add description</span> : <span href="#" onClick={this.disableDescription.bind(this)}>Remove description</span>}
                        </div>
                    </div>
                </div>
                <div className={classes('single-file-block-drop-overlay',isOver ? 'active' : '')}></div>
            </div>
        )
    }

    render() {
        return this.props.viewMode === 'editor' ? this.renderEditable() : this.renderStatic();
    }
}