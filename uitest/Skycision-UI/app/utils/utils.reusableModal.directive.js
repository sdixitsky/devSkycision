(function() {
    angular
        .module('skyApp.utils')
        .directive('reuseModal', [
            '$uibModal',
            '$http',
            '$parse',
            'TEMPLATE_DIR',
            ReusableModal
        ]);


    function ReusableModal($uibModal, $http, $parse, TEMPLATE_DIR) {

        return {
            restrict: 'A',
            transclude: true,
            template: '<a ng-click="open()" ng-transclude></a>',
            scope: {
                useCtrl: "@"
            },
            link: function(scope, ele, attrs) {

                scope.open = function(size) {

                    var modalInstance = $uibModal.open({
                        templateUrl: TEMPLATE_DIR + attrs.instanceTemplate,
                        controller: 'ModalInstanceCtrl',
                        size: 'md',
                        keyboard: false,
                        backdrop: true,
                        windowClass: 'app-modal-window'
                    });

                    modalInstance.result.then(function(result) {
                        debugger;
                        console.log('Finished');

                    });


                }
            }
        };
    };
    angular
        .module('skyApp.utils')
        .controller('ModalInstanceCtrl', [
            '$scope',
            '$uibModalInstance',
            '$http',
            '$filter',
            ModalInstanceCtrl
        ]);

    function ModalInstanceCtrl($scope, $uibModalInstance, $http, $filter) {
        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };
    };
})();