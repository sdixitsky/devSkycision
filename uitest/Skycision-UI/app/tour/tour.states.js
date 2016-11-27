(function() {
    angular
        .module('skyApp.tour')
        .config(['$stateProvider', '$urlRouterProvider', configureStates])

    function configureStates($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('home.tour', {
                name: 'home.tour',
                url: '/tour',
                data: {
                    sliderOpen: false
                }
            })
    }

})();