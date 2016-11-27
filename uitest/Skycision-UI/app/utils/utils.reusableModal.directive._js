(function() {
    angular
        .module('skyApp.utils')
        .directive('reuseModal', [
            '$uibModal',
            '$parse',
            'TEMPLATE_DIR',
            ReusableModal]);


function ReusableModal($uibModal, $parse, TEMPLATE_DIR) {
    
    return {
        restrict: 'A',
        transclude: true,
        template: '<a ng-click="open()" ng-transclude></a>',
        scope: {
            useCtrl: "@"
        },
        link: function(scope, ele, attrs) {

            scope.open = function() {
                var modalInstance = $uibModal.open({
                    templateUrl: TEMPLATE_DIR + attrs.instanceTemplate,
                    controller: scope.useCtrl,
                    size: 'md',
                    keyboard: false,
                    backdrop: true,
                    windowClass: 'app-modal-window'
                });

                modalInstance.result.then(function(result) {
                    console.log('Finished');
                }, function() {
                    console.log('Modal dismissed at : ' + new Date());
                });
            }
        }
    };
};

})();
