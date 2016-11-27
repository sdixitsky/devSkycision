(function() {
    angular
        .module('skyApp.root')
        .controller('HeaderController', HeaderController);

    HeaderController.$inject = ['$scope', '$state','UserService','AuthService', '$mdSidenav'];
    function HeaderController($scope, $state, UserService, AuthService, $mdSidenav) {
        var hc = this;
        activate();
        hc.openMenu = function() {
            $mdSidenav('left').toggle();
        };
        angular.extend($scope,{ 
            go: go,
            isActive: isActive,
            signOut: signOut,
        });

        function activate() {
            UserService.getUser()
            .then(user => {
                angular.extend($scope, {user:user})
            });
        }

        function isActive(val) {
            return $state.includes(val.toLowerCase());
        }

        function go(val) {
            $state.go(val.toLowerCase());
        }

        function signOut() {
            UserService.signOut();
            AuthService.signOut();
        }
    }

})();