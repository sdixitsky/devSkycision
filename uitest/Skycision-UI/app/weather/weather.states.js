(function() {
    angular
        .module('skyApp.weather')
        .config([
            '$stateProvider',
            '$urlRouterProvider',
            configureStates
        ]);


    function configureStates($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state("home.weather", {
                name: 'home.weather',
                url: '/weather',
                // resolve: {
                //     "operations":['UserService', 'MosaicDataService', function(UserService, MosaicDataService) {
                //         console.log('operations')
                //         return UserService.getOrg()
                //         .then(org => MosaicDataService.getOperations( org.orgId) )
                //         .then( ops => ops );
                //     }]
                // },
                views: {
                    'content': {
                        // template:"<br/>This feature is under construction - please check back soon!"
                        templateUrl: 'templates/weather/weather-view.html',
                        controller: 'WeatherController',
                    }
                },
                data: {
                    uploaderTarget: 'nav-uploader',
                    sliderOpen: true,
                    contentWidth: 100
                }
            })

        .state("home.weather.detail", {
            url: '/{detail}',
            parent: "home.weather",
            // templateUrl: 'templates/weather/weather-view.html',
            controller: ['$scope', '$stateParams', function($scope, $stateParams) {
                console.log($stateParams.detail);
                $scope.$parent.setOperation($stateParams.detail);
            }]
        })

    };

})();