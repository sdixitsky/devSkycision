(function() {
    angular
        .module('skyApp.myfarm')
        .config(['$stateProvider', '$urlRouterProvider', configureStates])

    function configureStates($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('home.myfarm', {
                name: 'home.myfarm',
                url: '/myfarm',
                views: {
                    'content': {
                        templateUrl: 'templates/myfarm/myfarm-view.html',
                        controller: 'myfarmController',
                    }
                },
                data: {
                    sliderOpen: true,
                    contentWidth: 100
                }
            })
    }

})();