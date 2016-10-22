import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react';
import update from 'react/lib/update';
import _ from 'lodash';
import classes from 'classnames';
import Uuid from 'uuid';

import HTML5Backend, { NativeTypes } from 'react-dnd-html5-backend';
import { DragSource, DropTarget } from 'react-dnd';

import BaseBlock from 'components/BaseBlock.js'
import ContentEditable from 'components/content-editable.js'
import Types from 'components/DNDType.js'

import { upload } from 'common/bend-uploader.js';
import BendUtils from 'common/bend-utils.js';

import ProgressBar from 'components/ProgressBar.js';


function convertBytes(bytes, precision) {
  let number;
  let units;
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
  filename = filename.toLowerCase();
  let formats = {
    'fmt-image': ['png', 'jpg', 'gif', 'jpeg', 'bmp'],
    'fmt-excel': ['xls', 'xlsx'],
    'fmt-video': ['avi', 'mov', 'mp4', 'm4v'],
    'fmt-word': ['doc', 'docx'],
    'fmt-pdf': ['pdf'],
  };

  let formatClass = '';
  _.each(formats, (fmts, key) => {
    if (_.any(fmts, (f) => _.endsWith(filename, '.' + f))) {
      formatClass = key;
      return false;
    }
  });

  return formatClass || 'fmt-default';
}

function supportsPreview(filename) {
  return _.any(
    ['png', 'jpg', 'gif', 'jpeg', 'bmp', 'pdf'],
    (f) => _.endsWith(filename.toLowerCase(), '.' + f));
}

const fileListTarget = {
  canDrop(props, monitor) {
    const item = monitor.getItem();
    return true;
  },

  hover(props, monitor, component) {
    const clientOffset = monitor.getClientOffset();
    // const componentRect = ReactDOM.findDOMNode(component).getBoundingClientRect();
    const isJustOverThisOne = monitor.isOver({ shallow: true });
    const canDrop = monitor.canDrop();

    const draggedId = monitor.getItem().id;
    if (draggedId !== props.id) {
      // props.moveBlock(draggedId,props.id);
    }
  },

  drop(props, monitor, component) {
    if (monitor.didDrop()) {
      return;
    }

    const item = monitor.getItem();
    component.addFiles(item.files);

    return { moved: true };
  },
};

const fileItemSource = {
  beginDrag(props) {
    return {
      id: props.id,
    };
  },
};

const fileItemTarget = {
  hover(props, monitor) {
    const draggedId = monitor.getItem().id;

    if (draggedId !== props.id) {
      props.moveFile(draggedId, props.id);
    }
  },
};

@DropTarget(Types.ExternalFile, fileItemTarget, connect => ({
    connectDropTarget: connect.dropTarget(),
}))
@DragSource(Types.ExternalFile, fileItemSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
    connectDragPreview: connect.dragPreview(),
}))
class FilesBlockItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: 'Default Name',
    }
  }

  renderStatic() {
    const { name, filename, filesize, fitImage } = this.props;
    var blob = this.props._blob || this.props.blob;

    var thumbnailURL = (fitImage ?
      _.get(blob, '_versions.thumbnail-fit._downloadURL') :
      _.get(blob, '_versions.thumbnail._downloadURL')) || _.get(blob, '_downloadURL');

    var previewStyle = {
      backgroundImage: blob && supportsPreview(filename) ? `url('${thumbnailURL}')` : '',
    };

    return (
      <a href={_.get(blob, '_downloadURL')} target="_blank">
        <div className="file-item">
          <div className={classes('preview', previewIconClass(filename))} style={previewStyle}>
            <span className="filesize">{convertBytes(filesize)}</span>
            <div className="download-overlay"></div>
          </div>
          <div className="details">
            <span className="attachment-icon"></span>
            <span className="file-name">{name}</span>
          </div>
        </div>
      </a>
    );
  }

  handleRemove() {
    if (this.props.onRemove) {
      this.props.onRemove(this.props.id);
    }
  }

  renderEditable() {
    const {
      name,
      isDragging,
      connectDragSource,
      connectDropTarget,
      connectDragPreview,
      uploader,
      filename,
      filesize,
      fitImage,
    } = this.props;

    var blob = this.props._blob || this.props.blob;

    const opacity = isDragging ? 0 : 1;
    const isUploading = !_.isEmpty(uploader);
    const progress = isUploading && uploader ? uploader.progress : 0;

    var closeStyle = {
      opacity: opacity,
    };

    var thumbnailURL = (fitImage ?
      _.get(blob, '_versions.thumbnail-fit._downloadURL') :
      _.get(blob, '_versions.thumbnail._downloadURL')) || _.get(blob, '_downloadURL');

    var previewStyle = {
      backgroundImage: blob && supportsPreview(filename) ? `url('${thumbnailURL}')` : '',
    };

    var progressLabel = isUploading && Math.round(progress) === 100 ? 'Processing...' : '';

    return connectDropTarget(connectDragPreview(
      <div className={classes('file-item is-editor', isDragging ? 'transparent' : '')}>
        {connectDragSource(
          <div
            className={classes('preview', previewIconClass(filename))}
            style={previewStyle}>
            <ProgressBar
              visible={isUploading}
              progress={progress}
              showLabel={true}
              labelText={progressLabel}
              animate={!_.isEmpty(progressLabel)}/>
            { !isUploading ? (<span className="filesize">{convertBytes(filesize)}</span>) : null }
          </div>
        )}
        <div className="details">
          <span className="attachment-icon"></span>
          <span className="file-name">{name}</span>
        </div>
        <div className="remove-button" style={closeStyle} onClick={::this.handleRemove}></div>
      </div>
    ));
  }

  render() {
    return this.props.viewMode === 'editor' ? this.renderEditable() : this.renderStatic();
  }
}

@DropTarget(Types.ExternalFile, fileItemTarget, connect => ({
    connectDropTarget: connect.dropTarget(),
}))
@DragSource(Types.ExternalFile, fileItemSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
    connectDragPreview: connect.dragPreview(),
}))
class FileListItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      description: 'File description goes here...',
      name: props.name,
    };
  }

  handleDescriptionChange(e) {
    this.notifyChange(this.props.name, e.target.value);
  }

  handleNameChange(e) {
    this.notifyChange(e.target.value, this.props.description);
  }

  handleRemove() {
    if (this.props.onRemove) {
      this.props.onRemove(this.props.id);
    }
  }

  notifyChange(name, description) {
    if (this.props.onChange) {
      this.props.onChange({
        id: this.props.id,
        name,
        description,
      });
    }
  }

  renderStatic() {
    const { name, filename, description, filesize, blob } = this.props;

    return (
      <div className="file-list-item">
        <a href={_.get(blob, '_downloadURL')} target="_blank">
          <div className="icon-container">
            <div className={classes('icon', previewIconClass(filename))}></div>
            <span className="file-size">{convertBytes(filesize)}</span>
            <div className="download-overlay"></div>
          </div>
        </a>
        <div>
          <div className="content-container">
            <div className="title" dangerouslySetInnerHTML={{ __html: name }}></div>
            <div className="description" dangerouslySetInnerHTML={{ __html: description }}></div>
          </div>
        </div>
      </div>
    );
  }

  renderEditable() {
    const {
      name,
      isDragging,
      connectDragSource,
      connectDropTarget,
      connectDragPreview,
      filename,
      filesize,
      description,
    } = this.props;

    return connectDropTarget(connectDragPreview(
      <div className={classes('file-list-item is-editor', isDragging ? 'transparent' : '')}>
        <div className="icon-container">
          <div className={classes('icon', previewIconClass(filename))}></div>
          <span className="file-size">{convertBytes(filesize)}</span>
        </div>
        <div>
          <div className="content-container">
            <div className="title">
              <ContentEditable html={name} onChange={::this.handleNameChange}/>
            </div>
            <div className="description">
              <ContentEditable html={description} onChange={::this.handleDescriptionChange}/>
            </div>
          </div>
        </div>
        {connectDragSource(<div className="drag-handler"></div>)}
        <div className="remove-button" onClick={::this.handleRemove}></div>
      </div>
    ));
  }

  render() {
    const isEditorMode = this.props.viewMode === 'editor';

    return isEditorMode ? this.renderEditable() : this.renderStatic();
  }
}

@DropTarget([NativeTypes.FILE], fileListTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  isOverCurrent: monitor.isOver({ shallow: true }),
  canDrop: monitor.canDrop(),
  itemType: monitor.getItemType()
}))
export default class FilesBlock extends BaseBlock {
  static propTypes = {
    mode: React.PropTypes.string,
  };

  static defaultProps = {
    mode: 'thumbnail',
  };

  constructor(props) {
    super(props);
    this.state = {
      files: props.data.files,
    };
  }

  componentWillReceiveProps(nextProps) {
    return;

    const { data } = nextProps;

    if (_.get(nextProps, 'data.files')) {
      this.setState({
        files: data.files,
      });
    }
  }

  componentDidMount() {
    console.log('File List Component Did Mount!');

    var files = _.clone(this.state.files, true);
    var ids = _(files).map((file) => file.id).value();

    var query = new Bend.Query();
    query.contains('_id', ids);
    BendUtils.wrapInCallback(Bend.File.find(query), (err, blobs) => {
      if (err) {
        console.log('Error while fetching blobs!');
        console.log(err);
        return;
      }

      var filesToProcess = _(files).filter(
        (file) => _.find(blobs, (blob) => (blob._id === file.id))).value();

      _.each(filesToProcess, (file) => {
        file.blob = _.find(blobs, (blob) => blob._id === file.id);
      });

      this.setState({
        files: files,
      });
    });
  }

  moveFile(id, afterId) {
    const { files, thumbnailsMode } = this.state;

    const file = files.filter(f => f.id === id)[0];
    const afterFile = files.filter(f => f.id === afterId)[0];
    const fileIndex = files.indexOf(file);
    const afterIndex = files.indexOf(afterFile);

    var newState = update(this.state, {
      files: {
        $splice: [
          [fileIndex, 1],
          [afterIndex, 0, file],
        ],
      },
    });

    this.setState(newState);
    this.notifyChange(newState);
  }

  notifyChange(state) {
    if (this.props.onChange) {
      this.props.onChange(this.props.id, state);
    }
  }

  renderFiles() {
    const { thumbnailsMode } = this.props;

    return _.map(this.state.files, (file, index) => {
      return this.props.mode === 'list' ?
        (<FileListItem viewMode={this.props.viewMode}
                       key={file.id} id={file.id}
                       name={file.name}
                       filename={file.filename}
                       filesize={file.filesize}
                       description={file.description}
                       moveFile={this.moveFile.bind(this)}
                       uploader={file.uploader}
                       blob={file.blob}
                       _blob={file._blob}
                       onRemove={this.onRemoveFile.bind(this)}
                       onChange={this.onFileChange.bind(this)}
            />)
          :
          (<FilesBlockItem viewMode={this.props.viewMode}
                           key={file.id}
                           id={file.id}
                           name={file.name}
                           filename={file.filename}
                           filesize={file.filesize}
                           description={file.description}
                           fitImage={thumbnailsMode === 'fit'}
                           moveFile={this.moveFile.bind(this)}
                           uploader={file.uploader}
                           blob={file.blob}
                           _blob={file._blob}
                           onRemove={this.onRemoveFile.bind(this)}
                           onChange={this.onFileChange.bind(this)}
          />);
      }, this);
  }

  handleFileNameChange(e, file) {
    // file.name = e.target.value;
  }

  onFileChange(obj) {
    var file = _.find(this.state.files, (file) => file.id === obj.id);
    if (file) {
      file.name = obj.name;
      file.description = obj.description;

      this.notifyChange(this.state);
    }
  }

  onRemoveFile(id) {
    console.log('onRemoveFile!');
    this.removeFile(id);
  }

  removeFile(id) {
    var newState = {
      files: _.filter(this.state.files, (file) => (file.id !== id)),
    };

    this.setState(newState);
    this.notifyChange(newState);

    // Remove actual file from the CDN.
    BendUtils.wrapInCallback(Bend.File.destroy(id), function (err) {
      if (err) {
        console.log('Error while removing blob!');
        console.log(err);
        return;
      }

      console.log('Blob has been successfully removed!');
    });
  }

  addFiles(files) {
    var that = this;

    this.setState({
      files: this.state.files.concat(_.map(files, (file) => {
        var id = Uuid.v4();
        var findFile = () => (_.find(this.state.files, (file) => (file.id === id)));

        upload(file)
          .on('error', (err) => {
            console.log('error');
            console.log(err);
          })
          .on('completeBlob', (blob) => {
            console.log('Complete Blob:');
            console.log(blob);

            var fl = findFile();
            if (fl && that.props.onChange) {
              fl.id = blob._id;
              id = blob._id;
              that.props.onChange(that.props.id, {
                files: that.state.files,
              });
            }
          })
          .on('uploadProgress', (value) => {
            var fl = findFile();
            if (fl && fl.uploader) {
              fl.uploader.phase = 'progress';
              fl.uploader.progress = value;
              this.setState(this.state);
            }
          })
          .on('completeUpload', (blob) => {
            var fl = findFile();
            if (fl && fl.uploader) {
              fl.phase = 'processing';
              this.setState(this.state);
            }

            var that = this;
            console.log('Complete Upload:');
            console.log(blob);

            var query = new Bend.Query();
            query.equalTo("_id", blob._id);
            BendUtils.wrapInCallback(Bend.File.find(query), function (err, blobs) {
              if (err) {
                console.log('Error while fetching blobs!');
                console.log(blobs);
                return;
              }

              console.log('blobs');
              console.log(blobs);

              var fl = findFile();
              if (fl && fl.uploader) {
                fl.uploader = undefined;
                fl.blob = _.first(blobs);
                that.setState(that.state);

                // Cache blob object.
                fl._blob = _.first(blobs);
                that.props.onChange(that.props.id, {
                  files: that.state.files,
                });
              }
            });
          });

        console.log(file);

        return {
          id: id,
          name: file.name,
          filename: file.name,
          filesize: file.size,
          description: 'File description...',
          uploader: {
            phase: 'started',
            progress: 0,
          },
        };
      }, this)),
    });
  }

  hasFiles() {
    return this.state.files.length;
  }

  renderEmpty() {
    return (
      <div className="is-empty">
        <h5>{'File list is empty. Drag & drop files here...'}</h5>
      </div>
    );
  }

  render() {
    const { isOver, canDrop, connectDropTarget, isDragging } = this.props;
    return connectDropTarget(
      <div className="files-block">
        <div className="container">
          { this.hasFiles() ? this.renderFiles() : this.renderEmpty()}
        </div>
        <div className={classes('drop-overlay', isOver ? 'active' : '')}></div>
      </div>
    );
  }
}
