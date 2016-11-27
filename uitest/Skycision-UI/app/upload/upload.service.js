(function() {

angular
    .module('skyApp.upload')
    .run(['UploadService','$state','$timeout',function(UploadService,$state,$timeout){
        $timeout(() => {
            UploadService.activate();
        },500);
    }])
    .factory('UploadService', [
        '$state',
        'AWSService',
        '$interval',
        '$timeout',
        '$q',
        'debounce',
        '$templateCache',
        UploadService
    ]);

function UploadService($state, AWSService, $interval, $timeout, $q, debounce, $templateCache) {
    var US = this;
    var s3 = AWSService.s3();
    var service = {
        getUploadHandler: getUploadHandler,
        setup: setup,
        move: move, 
        activate: activate
    };

    return service;
    
    function getUploadHandler() {
        return function(files) {
            console.log(files);
            return files.map(file => {
                var p = $q.defer();

                var managed = new AWS.S3.ManagedUpload({
                    ComputeChecksums: true,
                    params: {
                        Body: file,
                        Bucket: 'skycisiondropbucket',
                        Key: file.name,
                        ContentType: file.type
                    }
                });
                managed.on('httpUploadProgress', (progress) => {
                    US.dz.emit("uploadprogress", file, 100 * progress.loaded / progress.total, progress.loaded)
                });
                managed.send((err, data) => {
                    US.dz._finished(files, '', err);
                    debounce(US.dz.processQueue(), 200);
                });
            });
        }
    }

    function activate() {

        var PREVIEW_TEMPLATE = $templateCache.get('upload.preview.html');
        var REMOVE_FILE = $templateCache.get('upload.removefile.svg');

        Dropzone.autoDiscover = false;
        Dropzone.options.body = false;

        var dropzoneHolder = new Dropzone('#body', {
            url: '/',
            // clickable: false,
            autoProcessQueue: false,
            parallelUploads: 4,
            processing: function(file) {
                if (file.previewElement) {
                    file.previewElement.classList.add("dz-processing");
                    if (file._removeLink) {
                        return file._removeLink.innerHTML = this.options.dictCancelUpload;
                    }
                }
            },
            dictCancelUpload: "<img src='/static/img/cancel-upload.png' alt='Cancel Upload' title='Cancel Upload' width='25' height='25'>",
            dictRemoveFile: REMOVE_FILE,
            previewTemplate: PREVIEW_TEMPLATE
        });

        dropzoneHolder._uploadFiles = dropzoneHolder.uploadFiles;
        dropzoneHolder.uploadFiles = service.getUploadHandler(dropzoneHolder);
        US.dz = dropzoneHolder;
    }

    function setup(ele, querySelector) {
        US.ele = ele;
        US.dz.previewsContainer = Dropzone.getElement(querySelector);
        US.dz.clickableElements =  Dropzone.getElements("input.dz-browse", "clickable");
        var browseBtnElm = ele.find("#browseBtn");
        var deleteAllBtnElm = ele.find("#deleteAllBtn");
        var uploadBtnElm = ele.find("#uploadBtn");
        console.log(uploadBtnElm);
        
        US.dz.on("addedfile", function() {
            handleActionBtnsDisplay();
        });
        US.dz.on("removedfile", function() {
            handleActionBtnsDisplay();
        });
    
        uploadBtnElm.on('click', (e) => {
            e.stopPropagation();
            US.dz.processQueue();
        });
    
        deleteAllBtnElm.on('click', (e) => {
            e.stopPropagation(); 
            US.dz.removeAllFiles();
        });
        // handleActionBtnsDisplay();
		function handleActionBtnsDisplay() {
            var filesLen = US.dz.files.length
            browseBtnElm.addClass("showActive");
            if (filesLen === 0) {
                uploadBtnElm.removeClass("showActive");
                deleteAllBtnElm.removeClass("showActive");
            } else if (filesLen == 1) {
                uploadBtnElm.addClass("showActive");
                browseBtnElm.addClass("showActive");
                deleteAllBtnElm.removeClass("showActive");
            } else if (filesLen > 1) {
                uploadBtnElm.addClass("showActive");
                deleteAllBtnElm.addClass("showActive");
            }
        }
    }

    function move(target) {
        var uploaderTarget = $state.$current.data.uploaderTarget;
        if(US.dz.files.length === 0 || !!!uploaderTarget) {
            return
        }
        var s = `uploader-target[target-id="${uploaderTarget}"]`;
        if (US.ele.find('.dz-preview').length) {
        	service.setup(US.ele.appendTo(s),s);
        }
    }
    
}


})();
