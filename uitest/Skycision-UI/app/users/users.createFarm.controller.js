(function(){
    angular.module('skyApp.users')
        .controller('CreateFarmController', [
            '$scope',
            '$uibModalInstance',
            'UserService',
            CreateFarmController]);

    function CreateFarmController($scope, $uibModalInstance, UserService) {
        $scope.create = function(farm) {
            console.log(farm);
            UserService.createFarm(farm);
            $uibModalInstance.close();
        }
        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        }
    }
})();
