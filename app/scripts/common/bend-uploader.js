
import request from 'superagent';
import EventEmitter from 'eventemitter3';
import _ from 'lodash';


function createBlob(file,data,callback) {
    if(null == data._filename && (null != file._filename || null != file.name)) {
        data._filename = file._filename || file.name;
    }
    if(null == data.size && (null != file.size || null != file.length)) {
        data.size = file.size || file.length;
    }
    data.mimeType = data.mimeType || file.mimeType || file.type || 'application/octet-stream';

    var user = Bend.getActiveUser();
    if(!user) {
        callback(new Error("Active user is required!"));
        return;
    }

    request
        .post(Bend.API_ENDPOINT+"/blob/"+Bend.appKey)
        .send(data)
        .set("Authorization","Bend "+user._bmd.authtoken)
        .set("Content-Type","application/json")
        .end(function(err, res){
            if (res.ok) {
                callback(null,res.body);
            } else {
                callback(res.body);
            }
        });
}


export function upload(file,options) {
    var options = options  || {
            _public: true,
            _workflow: "preview-thumbnail"
        };
    var emitter = new EventEmitter();

    createBlob(file,options,function(err,blob){
        if(err) {
            console.log(err);
            emitter.emit('error',err);
            return;
        }

        emitter.emit('completeBlob',blob);

        request
            .put(blob._uploadURL)
            .send(file)
            .set(blob._requiredHeaders || {})
            .on('progress', function(e) {
                emitter.emit('uploadProgress',e.percent);
            })
            .end(function(err, res){
                if(err) {
                    console.log("Error while uploading file!");
                    console.log(err);
                    return;
                }

                emitter.emit('completeUpload',blob);
            });

    });

    return emitter;
}