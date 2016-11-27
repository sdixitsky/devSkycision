(function() {
    angular
        .module('skyApp.flights')
        .config(['$stateProvider', '$urlRouterProvider', configureStates])

    function configureStates($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('home.flights', {
                name: 'home.flights',
                url: '/flights',
                views: {
                    'content': {
                        templateUrl: 'templates/flights/flights-view.html',
                        controller: 'FlightsController',
                        controllerAs: 'fc'
                    }
                },
                data: {
                    sliderOpen: true,
                    contentWidth: 60
                }
            })
    }

})();