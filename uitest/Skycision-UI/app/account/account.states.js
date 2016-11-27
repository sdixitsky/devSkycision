(function() {
    angular
        .module('skyApp.account')
        .config(['$stateProvider', '$urlRouterProvider', configureStates]);

    function configureStates($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('home.account', {
                name: 'home.account',
                url: '/account',
                views: {
                    'content': {
                        templateUrl: 'templates/account/accountSettings-view.html',
                        controller: 'accountController',
                        controllerAs: 'ac'
                    }
                },
                data: {
                    sliderOpen: true,
                    contentWidth: 100
                }
            })
    }

})();