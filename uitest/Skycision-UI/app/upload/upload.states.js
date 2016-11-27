(function() {
    angular
        .module('skyApp.upload')
        .config(['$stateProvider', '$urlRouterProvider', configureStates]);

    function configureStates($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('home.upload', {
                url: '/upload',
                views: {
                    // 'main': {
                    //     template:'<sky-uploader uploader-id="{{uploadHolderId}}" move-target="nav-uploader"></sky-uploader>',
                    //     controller: skyuploadCtrl
                    // },
                    'content': {
                        template: '<sky-uploader uploader-id="uploadHolderIdasdfasdf" move-target="nav-uploader"></sky-uploader>',
                    }
                },
                data: {
                    sliderOpen: true,
                    contentWidth: 50
                }
            })
    }

    function skyuploadCtrl() {
        // $scope.uploadHolderId = 'dropzone2' + Math.ceil(Math.random()*10);
    }

    // skyuploadCtrl.$inject = ['$scope'];
})();