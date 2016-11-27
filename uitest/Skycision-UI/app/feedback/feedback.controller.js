(function() {

    angular
        .module('skyApp.feedback')
        .controller('feedbackController', [
            '$scope',
            '$http',
            '$filter',
            '$uibModal',
            '$log',
            feedbackController
        ]);


    function feedbackController($scope, $http, $filter, $uibModal, $log) {

        $scope.animationsEnabled = true;

        $scope.open = function(size) {

            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'templates/feedback-popup.html',
                controller: 'ModalInstanceCtrl',
                backdrop: true,
                backdropClass: 'feed-popup',
                keyboard: true,
                size: 'md',
                resolve: {
                    items: function() {
                        return $scope.items;
                    }
                }
            });

            modalInstance.result.then(function(selectedItem) {
                $scope.selected = selectedItem;

            }, function() {
                console.log("error");
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.toggleAnimation = function() {
            $scope.animationsEnabled = !$scope.animationsEnabled;
        };

    };

    // Please note that $uibModalInstance represents a modal window (instance) dependency.
    // It is not the same as the $uibModal service used above.

    angular
        .module('skyApp.feedback')
        .controller('ModalInstanceCtrl', [
            '$scope',
            '$uibModalInstance',
            '$http',
            ModalInstanceCtrl
        ]);

    function ModalInstanceCtrl($scope, $uibModalInstance, $http) {
        $scope.showFbForm = true;
        $scope.feedback = {
            text: ""
        };

        $scope.submit = function() {
            var audio = new Audio('static/img/email-sent.mp3');
            $.ajax({
                url: "https://formspree.io/skycisiontest@gmail.com",
                method: "POST",
                crossDomain: true,
                data: {
                    message: $scope.feedback.text
                },
                dataType: "json"
            }).done(function(res) {
                audio.play();
                $scope.showFbForm = false;
                $scope.$digest();
            });

        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };
    };

})();