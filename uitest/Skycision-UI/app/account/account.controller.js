(function() {
    angular
        .module('skyApp.account')
        .controller('accountController', [
            '$scope',
            '$q',
            '$state',
            'UserService',
            'AuthService',
            '$mdDialog',
            accountController
        ]);

    accountController.$inject = ['$http', '$timeout', '$interval']

    function accountController($scope, $q, $state, UserService, AuthService, $mdDialog, $http, $timeout, $interval) {
        var ac = this;

        ac.people = [{
            name: 'Adam',
            email: 'adam@email.com'
        }, {
            name: 'Amalie',
            email: 'amalie@email.com'
        }, {
            name: 'Estefanía',
            email: 'estefania@email.com'
        }, {
            name: 'Adrian',
            email: 'adrian@email.com'
        }, {
            name: 'Wladimir',
            email: 'wladimir@email.com'
        }, {
            name: 'Samantha',
            email: 'samantha@email.com'
        }, {
            name: 'Nicole',
            email: 'nicole@email.com'
        }, {
            name: 'Natasha',
            email: 'natasha@email.com'
        }, {
            name: 'Michael',
            email: 'michael@email.com'
        }, {
            name: 'Nicolás',
            email: 'nicolas@email.com'
        }];

        ac.changePassword = changePassword;
        ac.reset = reset;
        ac.reqSubmit = reqSubmit;

        ac.handleOrgId = function() {
            if (ac.neworgid) {
                UserService.updateOrgId(ac.neworgid);
            }
        }

        $scope.inviteUser = function(ev) {
            $mdDialog.show({
                controller: ["$scope", "$mdDialog", DialogController],
                templateUrl: 'templates/invite-user-view.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
            })

        };

        function DialogController($scope, $mdDialog) {

            $scope.cancel = function() {
                console.log('cancel');
                $mdDialog.cancel();
            };
            $scope.invite = function() {
                console.log('invite');
            };
        }
        // hide or show password
        $('.hide-password').on('click', function() {
            var togglePass = $(this),
                passwordField = togglePass.prev('input');

            ('password' == passwordField.attr('type')) ? passwordField.attr('type', 'text') : passwordField.attr('type', 'password');
            ('Hide' == togglePass.text()) ? togglePass.text('Show') : togglePass.text('Hide');
            //focus and move cursor to the end of input field
        });

        function reset() {
            console.log('reset');
        }

        function reqSubmit() {
            console.log('Request OrgId');
        }

        function changePassword() {
            console.log('change Password');
        }
        $scope.placement = {
            options: [
                'top',
                'top-left',
                'top-right',
                'bottom',
                'bottom-left',
                'bottom-right',
                'left',
                'left-top',
                'left-bottom',
                'right',
                'right-top',
                'right-bottom'
            ],
            selected: 'right'
        };

    }


})();