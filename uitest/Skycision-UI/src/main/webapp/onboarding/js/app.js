(function() {

    var onboard = angular.module('onBoard', ['ui.bootstrap']);

    onboard.controller('obSignup', [
        '$scope',
        '$q',
        '$uibModal',
        obSignupController

    ]);

    function obSignupController($scope, $q, $uibModal) {

        $scope.togglePasswordShow = togglePasswordShow;
        $scope.obCreateAcct = obCreateAcct;
        $scope.demo = demo;
        $scope.open = open;

        var formModal = $('.join-main'),
            formVerify = formModal.find('#cd-verify'),
            formSignup = formModal.find('#cd-signup');

        $scope.validateForm = function(account) {
            if ($scope.form.$valid) {
                obCreateAcct(account);
            }
        }

        //hide or show password
        function togglePasswordShow($event) {
            var togglePass = angular.element($event.target),
                passwordField = togglePass.prev('input');

            ('password' == passwordField.attr('type')) ? passwordField.attr('type', 'text'): passwordField.attr('type', 'password');
            ('Hide' == togglePass.text()) ? togglePass.text('Show'): togglePass.text('Hide');

        }

        function obCreateAcct(account) {
            $scope.setMode(1);
        }

        $scope.setMode = function(val) {
            switch (val) {

                case 0:
                    formSignup.addClass('is-selected');
                    formVerify.removeClass('is-selected');
                    break;
                case 1:
                    formSignup.removeClass('is-selected');
                    formVerify.addClass('is-selected');
                    break;
            }
        }

        function open(size) {
            var modalInstance = $uibModal.open({
                templateUrl: 'terms-and-conditions.html',
                controller: 'ModalInstanceCtrl',
                size: 'md',
                keyboard: false,
                backdrop: true,
                windowClass: 'app-modal-window'
            });
        }

        function demo(size) {
            var modalInstance = $uibModal.open({
                templateUrl: 'signup-form-view.html',
                controller: 'ModalInstanceCtrl',
                size: 'md',
                keyboard: false,
                backdrop: true,
                windowClass: 'app-modal-window'
            });
        }

    }

    /***/
    onboard.directive('confirmPassword', passwordMatch);

    function passwordMatch() {

        return {
            restrict: 'A',
            require: 'ngModel',
            scope: {
                confirmPassword: '=confirmPassword'
            },
            link: function(scope, element, attributes, ngModel) {
                ngModel.$validators.confirmPassword = function(modelValue) {
                    return modelValue === scope.confirmPassword;
                };

                scope.$watch('confirmPassword', function() {
                    ngModel.$validate();
                });
            }
        };
    }


    onboard.controller('ModalInstanceCtrl', [
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