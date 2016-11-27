(function() {
    angular
        .module('skyApp.mosaic')
        .config(['$stateProvider', '$urlRouterProvider', configureStates])
        .run(['$rootScope', ($rootScope, $state) => {
            $rootScope.$on('$stateChangeSuccess', (event, toState, toParams, fromState, fromParams) => {
                $rootScope.state = toState
            })
        }])

    function configureStates($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('home', {
                url: '',
                views: {
                    '@': {
                        templateUrl: 'templates/root/root.view.html',
                    },
                    'header@home': {
                        templateUrl: 'templates/root/header.html',
                        controller: 'HeaderController',
                        controllerAs: 'hc',
                    },
                    'nav@home': {
                        templateUrl: 'templates/root/nav.view.html',
                        controller: 'NavController',
                        controllerAs: 'nc',
                        resolve: {
                            'org': ['UserService', 'MosaicDataService',
                                function(UserService, MosaicDataService) {
                                    return UserService.getOrg()
                                        .then(org => {
                                            MosaicDataService.setOrg(org.orgId)
                                            return org;
                                        });
                                }
                            ]
                        },
                    },
                    'tabs@home': {
                        template: '<div ng-class="{true:\'apptour\'}[onTour]">' +
                            '<md-tabs class="tabs-top" md-no-ink md-selected="selectedTab">' +
                            '<md-tab class="md-primary" ng-repeat="tab in tabs" ng-click="onTabSelected(tab.sref)">' +
                            '<md-tab-label>' +
                            '<div ng-if="tab.name != \'Tour\'">' +
                            '<div class="menulabelstyle" wt-step="{{2 + $index}}" wt-group="tour" wt-position="bottom">' +
                            '{{tab.name}}' +
                            '<wt-step-content>' +
                            '<div ng-bind-html="tab.description"></div>' +
                            '</wt-step-content>' +
                            '</div>' +
                            '</div>' +
                            '<div class="menulabelstyle" ng-if="tab.name == \'Tour\'">' +
                            '{{tab.name}}' +
                            '</div>' +
                            '</md-tab-label>' +
                            '</md-tab>' +
                            '</md-tabs></div>',
                        controller: ['$scope', '$state', 'UserService', 'MosaicDataService', '$rootScope',
                            function($scope, $state, UserService, MosaicDataService, $rootScope) {
                                $rootScope.onTour = false;

                                $rootScope.$on("TOUR_END", function() {
                                    $rootScope.onTour = false;
                                });

                                $scope.onTabSelected = function(tab) {
                                    if (tab == 'home.tour') {
                                        $rootScope.onTour = true;
                                        $scope.startWalkthrough("tour");
                                    } else {
                                        $state.go(tab.toLowerCase());
                                    }
                                };

                                var ctrl = this;
                                ctrl.tabs = [{
                                    name: 'Maps',
                                    sref: "home.map",
                                    description: 'If you don\'t have shape files then select the \'Add Farm\' on the side navigation and enter the farm name with address.</br>' +
                                        '</br>' +
                                        'You can add a new block to the farm using google map drawing tool. Please select the hamburger menu on top right corener of map and select the polygon tool to draw the boundaries.</br>' +
                                        '<br /> Click <strong>Next</strong> to continue the tour.'
                                }, {
                                    name: 'Flights',
                                    sref: 'home.flights',
                                    routename: '/flights',
                                    description: 'Flights will give you the information about your flight\'s mission like Altitude, Start time and Duration.</br>' +
                                        ' You can also download the NDVI images in PNG,PDF,SHP,TIF formats.</br>' +
                                        '<br /> Click <strong>Next</strong> to continue the tour.'

                                }, {
                                    name: 'Weather',
                                    sref: 'home.weather',
                                    routename: '/weather',
                                    description: ' Weather will give you the updates on forecast like min-temp / max-temp, precipitation, windispeed, cloud cover etc..</br>' +
                                        'Currently the page is under construction.</br>' +
                                        'Please visit back for more updates.</br>' +
                                        '<br /> Click <strong>Next</strong> to continue the tour.'
                                }, {
                                    name: 'Upload',
                                    sref: 'home.upload',
                                    routename: '/upload',
                                    description: 'If you have the shape files ready then please upload here and we will notify you the process time and results.</br>' +
                                        '<br /> Click <strong>Next</strong> to continue the tour.'
                                }, {
                                    name: 'My farm',
                                    sref: 'home.myfarm',
                                    routename: '/myfarm',
                                    description: ' Are you NEW to Skycision?</br>' +
                                        'Then TOUR will navigate you. </br>' +
                                        '<br /> Click <strong>Next</strong> to continue the tour.'
                                }, {
                                    name: 'Tour',
                                    sref: 'home.tour',
                                    routename: '/tour',
                                    description: ' Are you NEW to Skycision?</br>' +
                                        'Then TOUR will navigate you. </br>' +
                                        '<br /> Click <strong>Next</strong> to continue the tour.'
                                }];


                                var tabIndex = ctrl.tabs.indexOf(
                                    ctrl.tabs.filter(t => $state.includes(t.sref))[0]
                                );

                                angular.extend($scope, {
                                    selectedTab: tabIndex === -1 ? 0 : tabIndex,
                                    tabs: ctrl.tabs
                                })

                                MosaicDataService.getOperations()
                                    .then(ops => ops.reduce((p, c) => {
                                        return p[c.opId] = c, p
                                    }, {}))
                                    .then(opsMap => {
                                        $scope.ops = opsMap;
                                    });
                            }
                        ]
                    },
                    'main@home': {
                        templateUrl: 'templates/root/main.html',
                        controller: 'MainController',
                        controllerAs: 'mc',
                        resolve: {
                            'theOperations': ['MosaicDataService',
                                function(MosaicDataService) {
                                    return MosaicDataService.getOperations()
                                        .then(ops => {
                                            return ops.reduce((p, c) => {
                                                p[c.opId] = c;
                                                return p;
                                            }, {})
                                        });
                                }
                            ]
                        }
                    }
                },
                redirectTo: 'home.map',
                data: {
                    uploaderTarget: 'nav-uploader',
                    sliderOpen: false
                }
            })

        .state('home.map', {
            name: 'map',
            url: '/map',
            data: {
                sliderOpen: false
            }
        })

        .state('home.map.detail', {
            name: 'home.map.detail',
            url: '/{detail}',
            views: {
                'detail': {
                    template: '',
                    controller: ['$scope', '$stateParams', 'MosaicDataService',
                        function($scope, $stateParams, MDS) {
                            $scope.setDetailOperation($stateParams.detail);
                        }
                    ]
                },
            },
        })
    }

})();