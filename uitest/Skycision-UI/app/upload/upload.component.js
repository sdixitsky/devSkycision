(function(){

angular
    .module('skyApp.upload')
    .factory('SkyUploaderService', [])
    .component('skyUploader',{
        controller: UploadController,
        templateUrl: 'templates/upload/upload-inset.view.html',
        bindings: {
            uploaderId: '@',
            moveTarget: '@',
            move: '&'
        }
    });


UploadController.$inject = ['$scope','UploadService','$interval','$timeout','$element'];
function UploadController($scope, UploadService, $interval, $timeout, ele) {
    var ctrl = this;

    $scope.$on('$destroy', function() {
         UploadService.move(ctrl.moveTarget)
    });
    $scope.status = {
    	    isCustomHeaderOpen: false,
    	    isFirstOpen: true,
    	    isFirstDisabled: false
    };
    
    ctrl.move = function() {
        console.log(ctrl.moveTarget,ele)
    }

    ctrl.$postLink = $timeout(function() {
        
        console.log(ctrl.uploaderId)
        if (!!!ctrl.uploaderId) {
            return
        }
        UploadService.setup(ele, `#${ctrl.uploaderId}`);
        // Dropzone.prototype.uploadFiles = UploadService.upload; 


        // $timeout(function(){
        //     console.log('timer');
        //     

        // },10000);
                // previewsContainer: `#${ctrl.uploaderId}`,
    },500)
}

})();
