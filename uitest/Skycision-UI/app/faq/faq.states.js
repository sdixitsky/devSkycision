(function() {
    angular
        .module('skyApp.faq')
        .config(['$stateProvider', '$urlRouterProvider', configureStates]);

    function configureStates($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('home.faq', {
                name: 'home.faq',
                url: '/faq',
                views: {
                    'content': {
                        templateUrl: 'templates/faq/faq-view.html',
                        //template: '<p>Page is under construction!</p>',
                        controller: 'faqController',
                        controllerAs: 'faqc'
                    }
                },
                data: {
                    sliderOpen: true,
                    contentWidth: 100
                }
            })
    }

})();