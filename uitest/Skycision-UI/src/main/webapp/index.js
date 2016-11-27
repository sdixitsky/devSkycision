'use strict';

(function () {

    angular.module('skyApp', [
    // 'ngRoute',
    "ui.router", 'ngAnimate', 'ngMaterial', 'ngSanitize', 'ngAria', 'ngCookies', 'rzModule', 'angular-walkthrough', 'skyApp.root', 'skyApp.users', 'skyApp.mosaic', 'skyApp.utils', 'skyApp.upload', 'skyApp.signup', 'skyApp.weather', 'skyApp.grid', 'skyApp.gallery', 'skyApp.feedback', 'skyApp.flights', 'skyApp.tour', 'skyApp.myfarm']).config(['AWSServiceProvider', ConfigureAWS]).config(['$httpProvider', ConfigureHttpProvider]).config(['WeatherServiceProvider', ConfigureWeather]).config(['$mdThemingProvider', function ($mdThemingProvider) {
        $mdThemingProvider.theme('default').primaryPalette('blue-grey', {
            'default': '800'
        }).backgroundPalette('grey', {
            'default': '100'
        }).accentPalette('light-blue', {
            'default': '600'
        });
    }]).constant({
        'TEMPLATE_DIR': '/templates/'
    }).constant({
        'LAMBDA_POST_VER': window.location.protocol !== 'https' || !window.location.hostname.contains('skycision') ? 'DEV' : 'BETA'
    })
    // .config(['$compileProvider', function ($compileProvider) {
    //   $compileProvider.debugInfoEnabled(false);
    // }])
    .run(['AWSService', 'AuthService', '$rootScope', '$state', '$stateParams', RunBlock]);

    function ConfigureRoutes($routeProvider, $locationProvider) {
        $routeProvider.when('/', {
            controller: 'MainController',
            controllerAs: 'mc',
            templateUrl: 'templates/mosaic.html'
        }).when('/signup', {
            controller: 'SignupController',
            controllerAs: 'sc',
            templateUrl: 'templates/signup-view.html'
        }).when('/login', {
            controller: 'SignupController',
            controllerAs: 'sc',
            templateUrl: 'templates/signup-view.html'
        }).otherwise({
            redirectTo: '/login'
        });
    }

    function RunBlock(AWSService, AuthService, $rootScope, $state, $stateParams) {
        console.log('runblock');
        AuthService.startAuthenticating();
        AWSService.ama();
        $rootScope.$on("$stateChangeError", console.log.bind(console));
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
    }

    function ConfigureWeather(WeatherServiceProvider) {
        WeatherServiceProvider.setup('mboOcHmIVl1goyNwgbeuM1dMXVLVt2nc6kG9a6C4');
    }

    function ConfigureHttpProvider($httpProvider) {
        $httpProvider.defaults.headers.post = {
            'Content-Type': 'application/json'
        };
    }

    function ConfigureAWS(AWSServiceProvider) {
        AWSServiceProvider.setArn('arn:aws:iam::717391330650:role/Cognito_SkycisionAuth_Role');
        AWSServiceProvider.setIdentityPool('us-east-1:77007577-a20b-40b2-8a3f-adf401a54271');
        // AWSServiceProvider.setIdentityPool('us-east-1:15eec0e9-05d9-47d1-9fe6-a344788eed1d;);
        AWSServiceProvider.setAMAOptions({
            appId: '3be50c4f17514713bad271ed00dc8570', //Amazon Mobile Analytics App ID
            appTitle: 'Skycision-beta', //Optional e.g. 'Example App'
            appVersionName: 'web-v0.3.0' //Optional e.g. '1.4.1'
        });
        AWSServiceProvider.setRegion('us-east-1');
        AWSServiceProvider.setUserPoolOptions({
            // UserPoolId: 'us-east-1_OeMgeOQiR',ClientId:'crhppg4tst53e3fcga76cemnv',
            UserPoolId: 'us-east-1_FGwWzvz1t',
            ClientId: '2442duhlr4rd3nk1a53nb4j6pe'
        });
    }
})();

window.onbeforeunload = function () {
    console.clear();
    console.log('onbeforeunload');
};

angular.element(document).ready(function () {
    angular.bootstrap(document, ['skyApp'], {
        strictDi: true
    });
});

function logMessage(message) {
    return !!message ? function () {
        var errors = [].concat(Array.prototype.slice.call(arguments)).filter(function (arg) {
            return arg instanceof Error;
        }).map(function (err) {
            err.stack.replace('↵', '\n');
            return err;
        });
        if (errors.length > 0) {
            errors.map(function (err) {
                return logMessage(err);
            });
        } else {
            angular.noop();
        }
        console.timeStamp();
        console.log(message, [].concat(Array.prototype.slice.call(arguments)));
    } : function () {
        var e = arguments[0];
        var message = arguments[0].message + '\n' + e.sourceURL.replace(window.href, '') + ':' + arguments[0].line + ':' + arguments[0].column + '\n';
        console.timeStamp('err stamp');
        console.log("%c" + message, 'background-color: hsla(120, 60%, 70%, 0.3);', arguments[0].stack);
    };
}
'use strict';

(function () {

    angular.module('skyApp.account', ['ngAnimate', 'ngSanitize', 'ui.bootstrap', 'ui.select']);
})();
'use strict';

(function () {
    angular.module('skyApp.account').controller('accountController', ['$scope', '$q', '$state', 'UserService', 'AuthService', '$mdDialog', accountController]);

    accountController.$inject = ['$http', '$timeout', '$interval'];

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

        ac.handleOrgId = function () {
            if (ac.neworgid) {
                UserService.updateOrgId(ac.neworgid);
            }
        };

        $scope.inviteUser = function (ev) {
            $mdDialog.show({
                controller: ["$scope", "$mdDialog", DialogController],
                templateUrl: 'templates/invite-user-view.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true
            });
        };

        function DialogController($scope, $mdDialog) {

            $scope.cancel = function () {
                console.log('cancel');
                $mdDialog.cancel();
            };
            $scope.invite = function () {
                console.log('invite');
            };
        }
        // hide or show password
        $('.hide-password').on('click', function () {
            var togglePass = $(this),
                passwordField = togglePass.prev('input');

            'password' == passwordField.attr('type') ? passwordField.attr('type', 'text') : passwordField.attr('type', 'password');
            'Hide' == togglePass.text() ? togglePass.text('Show') : togglePass.text('Hide');
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
            options: ['top', 'top-left', 'top-right', 'bottom', 'bottom-left', 'bottom-right', 'left', 'left-top', 'left-bottom', 'right', 'right-top', 'right-bottom'],
            selected: 'right'
        };
    }
})();
'use strict';

(function () {
    angular.module('skyApp.account').config(['$stateProvider', '$urlRouterProvider', configureStates]);

    function configureStates($stateProvider, $urlRouterProvider) {

        $stateProvider.state('home.account', {
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
        });
    }
})();
'use strict';

(function () {

    angular.module('skyApp.faq', []);
})();
'use strict';

(function () {
    angular.module('skyApp.faq').controller('faqController', ['$scope', '$q', '$location', '$anchorScroll', faqController]);

    function faqController($scope, $q, $location, $anchorScroll) {

        $scope.scrollTo = function (id) {
            $location.hash(id);
            $anchorScroll();
        };
    }
})();
'use strict';

(function () {
    angular.module('skyApp.faq').config(['$stateProvider', '$urlRouterProvider', configureStates]);

    function configureStates($stateProvider, $urlRouterProvider) {

        $stateProvider.state('home.faq', {
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
        });
    }
})();
'use strict';

(function () {

	angular.module('skyApp.feedback', ['ui.bootstrap']);
})();
'use strict';

(function () {

    angular.module('skyApp.feedback').controller('feedbackController', ['$scope', '$http', '$filter', '$uibModal', '$log', feedbackController]);

    function feedbackController($scope, $http, $filter, $uibModal, $log) {

        $scope.animationsEnabled = true;

        $scope.open = function (size) {

            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'templates/feedback-popup.html',
                controller: 'ModalInstanceCtrl',
                backdrop: true,
                backdropClass: 'feed-popup',
                keyboard: true,
                size: 'md',
                resolve: {
                    items: function items() {
                        return $scope.items;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                console.log("error");
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.toggleAnimation = function () {
            $scope.animationsEnabled = !$scope.animationsEnabled;
        };
    };

    // Please note that $uibModalInstance represents a modal window (instance) dependency.
    // It is not the same as the $uibModal service used above.

    angular.module('skyApp.feedback').controller('ModalInstanceCtrl', ['$scope', '$uibModalInstance', '$http', ModalInstanceCtrl]);

    function ModalInstanceCtrl($scope, $uibModalInstance, $http) {
        $scope.showFbForm = true;
        $scope.feedback = {
            text: ""
        };

        $scope.submit = function () {
            var audio = new Audio('static/img/email-sent.mp3');
            $.ajax({
                url: "https://formspree.io/skycisiontest@gmail.com",
                method: "POST",
                crossDomain: true,
                data: {
                    message: $scope.feedback.text
                },
                dataType: "json"
            }).done(function (res) {
                audio.play();
                $scope.showFbForm = false;
                $scope.$digest();
            });
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };
})();
'use strict';

(function () {

  angular.module('skyApp.flights', ['ngTable']);
})();
'use strict';

(function () {

    angular.module('skyApp.flights').directive('flightDisplay', ['$templateCache', FlightDisplay]);

    function FlightDisplay($templateCache) {
        return {
            template: $templateCache.get('flights/flight-display.partial.html')
        };
    }
})();
'use strict';

(function () {

    angular.module('skyApp.flights').directive('flightDownloads', ['dateFilter', FlightDownloadsDirective]);

    function FlightDownloadsDirective(dateFilter) {
        return {
            template: '<a ng-href="{{::flight[link + \'Url\']}}" download> {{::link | uppercase}} <i class="fa fa-download" aria-hidden="true"></i></a>'
        };
    }
})();
'use strict';

(function () {

    angular.module('skyApp.flights').directive('flightStats', ['dateFilter', FlightStatsDirective]);

    function FlightStatsDirective(dateFilter) {

        return {
            template: '<label><strong>{{::displayField}}</strong></label><span>{{::displayFlight(flight,displayField)}}</span>',
            controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {

                $scope.displayFlight = displayFlight;

                function displayFlight(flight, prop) {
                    switch (prop) {
                        case 'Start':
                            return dateFilter(flight[prop.toLowerCase()] * 1000, 'mediumTime');
                            break;
                        case 'Duration':
                            return moment.duration((flight.end - flight.start) * 1000).humanize();
                            break;
                        case 'Altitude':
                            return flight[prop.toLowerCase()] + 'm';
                            break;
                        default:
                            return flight[prop.toLowerCase()];
                    }
                }
            }],
            controllerAs: 'ctrl'
        };
    }
})();
'use strict';

(function () {
    angular.module('skyApp.flights').controller('FlightsController', FlightsController).run(["ngTableDefaults", configureDefaults]);

    FlightsController.$inject = ['$scope', '$state', 'UserService', 'NgTableParams', 'FlightsService'];
    function FlightsController($scope, $state, UserService, ngTableParams, FlightsService) {

        var FC = this;

        FC.cols = [{
            field: "op-name",
            title: "Op",
            sortable: "op-name",
            show: true,
            //groupable : "op-name",
            displaygroup: { stats: ["Altitude", "Start", "Duration"], links: ['png', 'pdf', 'shp', 'tif'] }
        }, {
            field: "block-id",
            title: "Block",
            sortable: "block-id",
            show: true
        }, {
            field: "start",
            title: "Date",
            sortable: "start",
            show: true
        }];

        FlightsService.loadFlights().then(function (flights) {

            FC.tableParams = new ngTableParams({
                // initial grouping
                group: {
                    "op-name": "desc"
                }
            }, {
                dataset: flights
            });
        });
    }

    function configureDefaults(ngTableDefaults) {
        ngTableDefaults.params.count = 10;
        ngTableDefaults.settings.counts = [];
    }
})();
"use strict";

(function () {
	"use strict";

	angular.module("skyApp.flights").factory("FlightsService", FlightsService);

	FlightsService.$inject = ["AWSService", "UserService"];
	function FlightsService(AWSService, UserService) {
		var service = {
			USERS_TABLE: 'users-skycision',
			OPS_TABLE: 'ops-skycision',
			ORGS_TABLE: 'orgs-skycision',
			BLOCKS_TABLE: 'blocks-skycision',
			INDEX_TABLE: 'id-singleton',
			FARM_BUCKET: "skycisionfarmbucket",
			DATA_BUCKET: "skycisiondatabucket",
			FLIGHTS_TABLE: "flights-skycision",
			loadFlights: loadFlights
		};

		return service;

		function loadFlights() {

			return UserService.getOrg().then(function (_ref) {
				var orgId = _ref.orgId;

				console.log(orgId);
				return AWSService.dynamo().then(function (dynamo) {
					// Find Org's flights
					var requestItems = {
						ReturnConsumedCapacity: 'TOTAL',
						TableName: service.FLIGHTS_TABLE,
						IndexName: "org-index",
						KeyConditionExpression: "org = :orgVal",
						ExpressionAttributeValues: {
							":orgVal": orgId
						}
					};
					return dynamo.do('query', requestItems);
				}).then(function (f) {
					return AWSService.s3().then(function (s3) {
						return f.Items.map(function (item) {
							var prefix = item.prefix;
							var suffixes = ['png', 'pdf', 'preview', 'shp', 'tif'];
							suffixes.map(function (suf) {
								item[suf + 'Url'] = s3.getSignedUrl('getObject', {
									Key: prefix + item[suf],
									Bucket: service.DATA_BUCKET
								});
							});

							return item;
						});
					});
				});
			}).catch(console.log);
		}
	}
})();
'use strict';

(function () {
    angular.module('skyApp.flights').config(['$stateProvider', '$urlRouterProvider', configureStates]);

    function configureStates($stateProvider, $urlRouterProvider) {

        $stateProvider.state('home.flights', {
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
        });
    }
})();
'use strict';

(function () {

	angular.module('skyApp.gallery', ['gallery']);
})();
'use strict';

(function () {

	angular.module('skyApp.gallery').controller('galleryController', ['$scope', '$rootScope', tileGallery]);

	function tileGallery($scope, $rootScope) {}
})();
'use strict';

(function () {
	angular.module('skyApp.grid', ['nvd3', 'gridster']);
})();
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

(function ($) {
    angular.module('skyApp.grid').factory('GraphService', ['$q', GraphService]);

    function GraphService($q) {
        var service = {};
        var DateType = {
            MINUTE: 'MINUTE',
            HOUR: 'HOUR',
            DAY: 'DAY',
            WEEK: 'WEEK',
            YEAR: 'YEAR'
        };

        Object.freeze(DateType);

        service.createGraphs = createGraphs;

        return service;

        function createGraphs(config) {
            var _config = config;
            return $q.all(config.map(function (c) {
                return $q(function (resolve, reject) {
                    createGraph(c)
                    // .then(formatDataForChart)
                    .then(resolve).catch(function (err) {
                        console.log(error);
                        reject(err);
                    });
                });
            }));
        }

        /*
         *  Data & Options Generators
         */
        function createGraph(config) {
            // var o = d3.scale.linear().domain(getDomain('y',config)).range(colorbrewer.RdBu[5]);
            return config.chartoptions = {
                chart: {
                    // color: ((d,i) => {
                    //     console.log(d,i);
                    //     return o(d.values[i].y)
                    // }),
                    type: 'lineChart',
                    margin: config.margin || {
                        top: 10,
                        right: 30,
                        bottom: 90,
                        left: 70
                    },
                    xDomain: getDomain('x', config),
                    yDomain: getDomain('y', config),
                    x: function x(d) {
                        return d.x;
                    },
                    y: function y(d) {
                        return d.y;
                    },
                    useInteractiveGuideline: true,
                    xAxis: getAxis(config.xConfig),
                    yAxis: getAxis(config.yConfig),
                    callback: function callback() {
                        console.log("!!! lineChart callback !!!");
                    },
                    interpolate: 'linear'
                },
                title: config.header || {
                    enable: true,
                    text: '',
                    css: {
                        'padding-top': '40px',
                        'padding-left': '20px',
                        'padding-right': '20px'
                    }
                },
                subtitle: config.subtitle || {
                    enable: true,
                    text: '',
                    css: {
                        'text-align': 'center'
                    }
                },
                styles: {
                    classes: {
                        'with-transitions': true
                    }
                }
            }, $q.when(config);
        }

        function getAxis(config) {
            // value we can infer from types in config
            var days = config.unit == DateType.DAY ? 6 : null;

            return {
                axisLabel: config.axisLabel,
                tickFormat: getTickFormat(config),
                ticks: config.ticks || undefined,
                tickWidth: config.tickWidth || undefined
            };
        }

        function getDomain(axisName, config) {
            var cfg = config[axisName + 'Config'];
            var domain, max, min;
            if (!!cfg.param && cfg.param === 'time') {
                return undefined;
            } else if ('object' === _typeof(cfg.axisStyle)) {
                return cfg.axisStyle;
            } else if (!!cfg.yParams && angular.isArray(cfg.yParams)) {
                domain = [];
                max = d3.max(config.chartdata.map(function (cd) {
                    return d3.max(cd.values.map(function (v) {
                        return v.y;
                    }));
                }));
                switch (cfg.axisStyle) {
                    case 'absolute':
                        domain = [0, max];
                        break;
                    case 'relative':
                        min = d3.min(config.chartdata.map(function (cd) {
                            return d3.min(cd.values.map(function (v) {
                                return v.y;
                            }));
                        }));
                        domain = [min, max];
                        break;
                }
                return domain;
            }

            domain = [];
            max = d3.max(config.chartdata.map(function (p) {
                return p[axisName];
            }));
            switch (cfg.axisStyle) {
                case 'absolute':
                    domain = [0, max];
                    break;
                case 'relative':
                    min = d3.min(config.chartdata.map(function (p) {
                        return p[axisName];
                    }));
                    domain = [min, max];
                    break;
            }
            return domain;
        }

        // function formatDataForChart(config) {
        //     return config.chartdata = {
        //         key: config.title,
        //         values: config.data,
        //         color: config.color,
        //         area: config.area
        //     }, config;
        // }

        function getTickFormat(config) {
            if (config.param === "time") {
                return getDateFormat(config.unit);
            } else {
                return function (d) {
                    return d3.format(config.unitFmt)(d);
                };
            }
        }

        function getDateFormat(dateType) {
            var formatString;
            switch (dateType) {
                case DateType.MINUTE:
                    formatString = '%M';
                    break;
                case DateType.HOUR:
                    formatString = '%h';
                    break;
                case DateType.DAY:
                    formatString = '%a';
                    break;
                case DateType.MONTH:
                    formatString = '%b';
                    break;
                case DateType.YEAR:
                    formatString = '%Y';
                    break;
            }
            return function (d) {
                return d3.time.format(formatString)(new Date(d * 1000));
            };
        }
    };
})(jQuery);
'use strict';

(function () {
    angular.module('skyApp.grid').factory('WidgetService', ['$q', WidgetService]);

    function WidgetService($q) {
        var service = {};

        service.createWidgets = createWidgets;
        return service;
        /*
         *  Data & Options Generators
         */

        function createWidgets(graphs) {
            return $q.all(graphs).then(function (gs) {
                return gs.map(createWidget);
            });
        }

        function createWidget(_ref) {
            var opts = _ref.chartoptions;
            var data = _ref.chartdata;
            var name = _ref.title;
            var _ref$dims = _ref.dims;
            _ref$dims = _ref$dims === undefined ? {} : _ref$dims;
            var c = _ref$dims.col;
            var r = _ref$dims.row;
            var _ref$dims$sizeX = _ref$dims.sizeX;
            var x = _ref$dims$sizeX === undefined ? 2 : _ref$dims$sizeX;
            var _ref$dims$sizeY = _ref$dims.sizeY;
            var y = _ref$dims$sizeY === undefined ? 1 : _ref$dims$sizeY;

            return {
                col: c,
                row: r,
                sizeX: x,
                sizeY: y,
                width: 'auto',
                colWidth: 'auto',
                name: name,
                chart: {
                    options: opts,
                    data: data,
                    api: {}
                }
            };
        }
    };
})();
"use strict";

(function () {

    angular.module('skyApp.mosaic', [
    //"ui.router",
    "skyApp.flights", "skyApp.weather", "skyApp.upload", "skyApp.account", "skyApp.faq"]);
})();
'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

(function () {

    angular.module('skyApp.mosaic').component('mapComponent', {
        template: '<div id="map"></div>',
        transclude: true,
        controller: MosaicController,
        bindings: {
            detailOperation: '<',
            mapSource: '&',
            // map: '=?',
            changeDrawMode: '&'
        }
    });

    MosaicController.$inject = ['$scope', '$http', '$q'];
    function MosaicController($scope, $http, $q) {
        var ctrl = this;
        ctrl.loadTiles = loadTiles;

        ctrl.$onInit = function () {
            ctrl.mapSource().then(function (theMap) {
                ctrl.map = theMap;
            });
        };

        ctrl.$onChanges = function ($changes) {
            console.log($changes);
            if (!!$changes.detailOperation) {
                var newDO = $changes.detailOperation;
                if (!!newDO.currentValue && !!newDO.isFirstChange()) {
                    ctrl.loadTiles(newDO.op_id);
                }
            }
        };
        // $scope.$watch('detailOperation', function(newVal, oldVal) {
        //     console.log(newVal, oldVal);
        //     if (!!newVal){
        //         if (!!!ctrl.operation || newVal !== ctrl.operation) {
        //             ctrl.loadTiles(newVal.op_id);
        //         }
        //     }
        // })

        function loadTiles(id) {
            console.log(id);
            $http({
                method: 'GET',
                url: '/map/gray/tilemapresource.json'
            }).then(function (response) {
                console.log(response.data);
            });
        }

        function loadStandardMap() {
            ctrl.setMap().then(function (map) {
                console.log(map);
                var imageMapType = new google.maps.ImageMapType({
                    getTileUrl: function getTileUrl(coord, zoom) {
                        if (zoom < 17 || zoom > 20 || bounds[zoom][0][0] > coord.x || coord.x > bounds[zoom][0][1] || bounds[zoom][1][0] > coord.y || coord.y > bounds[zoom][1][1]) {
                            return null;
                        }

                        return '//kml-skycision-com.s3.amazonaws.com/06032016/' + zoom + '/' + coord.x + '/' + coord.y + '.png';
                    },
                    tileSize: new google.maps.Size(256, 256)
                });

                ctrl.map.overlayMapTypes.push(imageMapType);
            });
        }

        function onInit() {
            ctrl.setMap().then(function (map) {
                console.log('$onInit');

                // loadTiles();

                var map = ctrl.map;

                var mapMinZoom = 16;
                var mapMaxZoom = 20;
                var mapBounds = new google.maps.LatLngBounds(new google.maps.LatLng(38.21452332, -122.34497517), new google.maps.LatLng(38.21863355, -122.34212121));

                var TILE_SIZE = 256;
                function ClipMapType(bounds, map) {
                    this.conv = function (p) {
                        return [p.lat(), p.lng()];
                    };

                    this.tileSize = new google.maps.Size(256, 256);
                    this.rectangle = new google.maps.Rectangle({
                        bounds: bounds,
                        strokeColor: '#7F7F7FF',
                        strokeOpacity: 0,
                        fillOpacity: 0,
                        // editable: true,
                        // draggable: true,
                        map: map
                    });
                    this.map = ctrl.map;
                }

                // The mapping between latitude, longitude and pixels is defined by the web
                // mercator projection.
                function project(latLng) {
                    var siny = Math.sin(latLng.lat() * Math.PI / 180);

                    // Truncating to 0.9999 effectively limits latitude to 89.189. This is
                    // about a third of a tile past the edge of the world tile.
                    siny = Math.min(Math.max(siny, -0.9999), 0.9999);

                    return new google.maps.Point(TILE_SIZE * (0.5 + latLng.lng() / 360), TILE_SIZE * (0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI)));
                }

                ClipMapType.prototype.getTile = function (coord, zoom, ownerDocument) {
                    var self = this;
                    var map = this.map;
                    this.drawn = false;
                    var proj = this.map.getProjection();
                    var z2 = Math.pow(2, zoom);
                    self.zoom = z2;
                    var tileXSize = 256 / z2;
                    var tileYSize = 256 / z2;
                    var tileBounds = new google.maps.LatLngBounds(proj.fromPointToLatLng(new google.maps.Point(coord.x * tileXSize, (coord.y + 1) * tileYSize)), proj.fromPointToLatLng(new google.maps.Point((coord.x + 1) * tileXSize, coord.y * tileYSize)));
                    if (!mapBounds.intersects(tileBounds) || zoom < mapMinZoom || zoom > mapMaxZoom) return ownerDocument.createElement('div');

                    // Your url pattern below
                    var url = getCustomTileUrl(coord, zoom, proj);
                    var image = new Image();

                    console.log(url);
                    var canvas = ownerDocument.createElement('canvas');
                    canvas.width = this.tileSize.width;
                    canvas.height = this.tileSize.height;
                    var context = canvas.getContext('2d');
                    context.save();
                    var xdif = coord.x * this.tileSize.width;
                    var ydif = coord.y * this.tileSize.height;

                    var rectangle = this.rectangle;
                    var that = this;

                    var scale = [[158, 1, 66], [213, 62, 79], [244, 109, 67], [253, 174, 97], [254, 224, 139], [255, 255, 191], [230, 245, 152], [171, 221, 164], [102, 194, 165], [50, 136, 189], [94, 79, 162]];

                    image.onload = function () {

                        var dims = getRectDims(rectangle.getBounds(), self.zoom);
                        // var context = obj.context;

                        context.restore();
                        context.save();
                        context.clearRect(0, 0, canvas.width, canvas.height);
                        context.beginPath();
                        context.rect.apply(context, _toConsumableArray(dims));
                        context.clip();
                        context.drawImage(image, 0, 0);
                        that.imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                        var pixels = that.imageData.data;
                        context.clearRect(0, 0, canvas.width, canvas.height);
                        var length = pixels.length;
                        var i, c;
                        for (i = 0; i < length; i++) {

                            c = scale[Math.floor(pixels[i * 4] / 255.1 * 12)] || [undefined, undefined, undefined];
                            pixels[i * 4] = c[0];
                            pixels[i * 4 + 1] = c[1];
                            pixels[i * 4 + 2] = c[2];
                        }
                        context.putImageData(that.imageData, 0, 0);

                        context.closePath();
                    };

                    image.src = url;

                    function getRedraw(obj) {

                        if (Date.now() % 100 <= 20 || !obj.drawn) {
                            obj.drawn = true;
                            return function redrawRectangle() {
                                var r = obj.rectangle;
                                var dims = getRectDims(r.getBounds(), obj.zoom);
                                // var context = obj.context;

                                context.restore();
                                context.save();
                                context.clearRect(0, 0, canvas.width, canvas.height);
                                context.beginPath();
                                context.rect.apply(context, _toConsumableArray(dims));
                                context.clip();
                                context.putImageData(obj.imageData, 0, 0);
                                // var imageData = context.getImageData(0,0,canvas.width,canvas.height);
                                // var pixels = imageData.data;
                                // context.clearRect(0,0,canvas.width,canvas.height);
                                // var length = pixels.length;
                                // var i;
                                // for (i = 0; i<length; i++) {
                                //     var gray = pixels[i*4];
                                //     pixels[i*4] = Math.max(0,gray-50);
                                //     pixels[i*4+1] = Math.max(0,gray-50);
                                // }
                                // context.putImageData(imageData, 0, 0);
                                context.closePath();
                            };
                        } else {
                            return angular.noop;
                        }
                    }

                    google.maps.event.addListener(this.rectangle, 'bounds_changed', getRedraw(self));

                    function getRectDims(bounds, zoom) {

                        var sw = bounds.getSouthWest();
                        var ne = bounds.getNorthEast();

                        var worldSW = project(sw);
                        var worldNE = project(ne);

                        var BL = new google.maps.Point(Math.floor(worldSW.x * zoom), Math.floor(worldSW.y * zoom));

                        var TR = new google.maps.Point(Math.floor(worldNE.x * zoom), Math.floor(worldNE.y * zoom));

                        var w = Math.abs(TR.x - BL.x);
                        var h = Math.abs(TR.y - BL.y);
                        return [BL.x - xdif, TR.y - ydif, w, h];
                    }

                    return canvas;
                };

                function getCustomTileUrl(coord, zoom) {
                    return '/map/gray/' + zoom + '/' + coord.x + '/' + coord.y + '.png';
                }
            });

            // https://developers.google.com/maps/documentation/javascript/examples/maptype-image-overlay
            // var imageMapType = new google.maps.ImageMapType({
            //     : ,
            //     // projection: ctrl.map.getProjection
            //     tileSize: new google.maps.Size(256, 256),
            //     minZoom: mapMinZoom,
            //     maxZoom: mapMaxZoom,
            //     name: 'Tiles',
            //     alt: 'uniquestring',
            //     zIndex:-100,
            // });
            // console.log('map',ctrl.map);
            // console.log('layer',imageMapType);
            // map.overlayMapTypes.push(new ClipMapType(mapBounds, map));
        }
    }
})();
'use strict';

(function () {
    angular.module('skyApp.mosaic').factory('MosaicDataService', ['$q', '$http', '$state', '$cacheFactory', 'AWSService', MosaicDataService]);

    function MosaicDataService($q, $http, $state, $cacheFactory, AWSService) {
        console.log('mosaicdataservice init');
        var MDS = this;

        var orgDefer = $q.defer();
        MDS.orgId = orgDefer.promise;

        var opsCache = $cacheFactory('mds-ops');

        var service = {
            setOrg: setOrg,
            getOperations: getOperations,
            USERS_TABLE: 'users-skycision',
            OPS_TABLE: 'ops-skycision',
            ORGS_TABLE: 'orgs-skycision',
            BLOCKS_TABLE: 'blocks-skycision',
            INDEX_TABLE: 'id-singleton',
            FARM_BUCKET: "skycisionfarmbucket",
            createBlockFromGeoJSONFeatures: createBlockFromGeoJSONFeatures

        };

        return service;

        function setOrg(orgId) {
            orgDefer.resolve(orgId);
        }

        function getOperations() {
            return MDS.orgId.then(function (id) {
                return getOperationsWithCache(id);
            });
        }
        function camelCase(name) {
            var SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
            var MOZ_HACK_REGEXP = /^moz([A-Z])/;
            return name.replace(SPECIAL_CHARS_REGEXP, function (_, separator, letter, offset) {
                return offset ? letter.toUpperCase() : letter;
            }).replace(MOZ_HACK_REGEXP, 'Moz$1');
        }

        function getOperationsWithCache(id) {
            var operations = opsCache.get(id);
            if (!!operations) {
                return $q.when(JSON.parse(operations));
            }

            console.log(id);

            var d = $q.defer();
            var _s3 = AWSService.s3();
            AWSService.dynamo().then(function (dynamo) {
                // Find the User's Org's Operations
                var requestItems = {
                    ReturnConsumedCapacity: 'TOTAL',
                    TableName: service.OPS_TABLE,
                    KeyConditionExpression: "org = :orgVal",
                    ExpressionAttributeValues: {
                        ":orgVal": id
                    }
                };
                return dynamo.do('query', requestItems);
            }).then(function (opsData) {
                return opsData.Items;
            }).then(function (opsItems) {
                console.log(opsItems);
                //            opsItems.reduce( (prev,cur) => {
                //              var out = cur.op;
                //              angular.forEach(cur.data,(val,key) => {out[key] = val});                       
                //              return prev.concat(out);
                //          },[]);

                //d.resolve(opsItems);

                // Parse the User's Org's Operations into objects for mainController
                var ops = opsItems.map(function (op) {
                    return _s3.then(function (s3) {
                        return s3.getObject({
                            Key: op['op-id'] + '/farm.json',
                            Bucket: service.FARM_BUCKET,
                            ResponseContentDisposition: 'application/json',
                            ResponseContentEncoding: 'utf-8'
                        }).then(function (data) {
                            return {
                                op: op,
                                data: angular.fromJson(data.Body.toString())
                            };
                        });
                    });
                });

                $q.all(ops).then(function (opsResolved) {
                    var parsed = opsResolved.map(function (obj) {
                        var out = { op: {} };
                        out.data = obj.data;
                        angular.forEach(obj.op, function (val, key) {
                            out.op[camelCase(key)] = val;
                        });
                        return out;
                    }).reduce(function (prev, cur) {
                        var out = cur.op;
                        angular.forEach(cur.data, function (val, key) {
                            out[key] = val;
                        });
                        return prev.concat(out);
                    }, []);
                    opsCache.put(id, JSON.stringify(parsed));
                    d.resolve(parsed);
                }).catch(function (err) {
                    return console.log(err);
                });
            });

            return d.promise;
        }

        function createBlockFromGeoJSONFeatures(block) {
            getIndex('block').then(function (id) {
                block['block-id'] = id[0];
                console.log(id);
                var params = {
                    TableName: service.BLOCKS_TABLE,
                    Item: block
                };

                return AWSService.dynamo().then(function (dynamo) {
                    return dynamo.do("put", params);
                });
            }).then(function (d) {
                return d.Item;
            }).then(console.log).catch(console.log);
        }

        function getIndex(type, amountToIncrement) {

            amountToIncrement = amountToIncrement || 1;
            console.log(amountToIncrement);
            return $q(function (resolve, reject) {
                AWSService.dynamo().then(function (dynamo) {
                    // get the operation index from the id-singleton table
                    dynamo.do('update', {
                        TableName: service.INDEX_TABLE,
                        Key: {
                            'id-type': type
                        },
                        UpdateExpression: "set idcount = idcount + :val",
                        ExpressionAttributeValues: {
                            ":val": amountToIncrement
                        },
                        ReturnValues: "UPDATED_NEW"
                    }).then(function (response) {
                        console.log(response);
                        var newIndex = response.Attributes.idcount;
                        var inds = [];

                        var i = void 0;
                        for (i = 0; i < amountToIncrement; i++) {
                            inds.push(newIndex - i);
                        }

                        var newIds = inds.map(function (d) {
                            return ('000000' + d.toString('36')).slice(-6);
                        });

                        resolve(newIds);
                    });
                }).catch(reject);
            });
        }
    }
})();
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function () {

    angular.module('skyApp.mosaic').controller('MainController', ['$scope', '$log', '$timeout', '$interval', '$q', '$compile', 'UserService', 'theOperations', '$state', 'MosaicDataService', MainController]);

    function MainController($scope, $log, $timeout, $interval, $q, $compile, UserService, operations, $state, MosaicDataService) {

        // Alias for the controller object to avoid
        // confusion inside function scopes, etc
        var MC = this;
        MC.expandctrls = false;
        var map;
        MC.operations = operations;
        MC.show = true;
        /*
        For clarity, all methods added to the MainController object (aliased above from "this" to "MC")
        or the $scope object should be defined as function declarations and assigned to the property of 
        the same name on the object.
        Keep those assignments relatively organized and towards the top of the file.
         This works because function declarations are hoisted to the top of their scope, unlike vars or
        function expressions.
         As time permits, a lot of these methods should be bundled into their own services (all the map
        plotting, etc.) because the M/V/C separation is pretty blurred right now.
        */

        MC.activate = activate;

        // app state switching methods
        MC.loadTiles = loadTiles;

        // map zoom method, accepts bbox
        // MC.setOperation = setOperation;
        MC.setBBox = setBBox;

        // flightplanning methods
        MC.generateFields = generateFields;
        MC.confirmField = confirmField;

        // important local state variables
        MC.farmToDraw = null;
        MC.doneAdd = false;

        MC.initMap = initMap;

        MC.getMap = getMap;
        var mapDefer = $q.defer();
        var mapPromise = mapDefer.promise;

        MC.activate();

        function activate() {
            angular.extend($scope, {
                savedFields: [],
                fieldInProgress: null,
                markers: [],
                newFieldName: '',
                addMode: false,
                getMap: getMap,
                setDetailOperation: setOperation
            });

            // initMap();

            // mapActive: $state.current.mapActive
            UserService.getUser().then(function (user) {
                $scope.user = user;
            });
            UserService.getOrg().then(function (org) {
                MC.orgs = [org];
                MC.currentOrg = org;
                $timeout(function () {
                    MC.initMap(org);
                }, 250);
            });
        }

        function getMap() {
            console.log('MainController getMap');
            return mapPromise;
        }

        function handleResize() {
            if (map) {
                var center = map.getCenter();
                google.maps.event.trigger(map, "resize");
                map.setCenter(center);
            }
        }

        //Map initialization 
        function initMap(org) {

            map = new google.maps.Map(document.getElementById('map'), {
                center: {
                    "lat": 37.09024,
                    "lng": -95.712891
                },
                zoom: 6,
                mapTypeId: google.maps.MapTypeId.SATELLITE,
                zoomControl: true,
                zoomControlOptions: {
                    style: google.maps.ZoomControlStyle.LARGE
                },
                scaleControl: true,
                rotateControl: true,
                fullscreenControl: false,
                tilt: 0,
                // minZoom: 2,
                draggableCursor: 'default',
                mapTypeControlOptions: {
                    style: google.maps.MapTypeControlStyle.DEFAULT,
                    position: google.maps.ControlPosition.TOP_CENTER
                },
                zIndex: 3
            });
            $scope.map = map;
            mapDefer.resolve(map);

            MC.setBBox(org.bbox);

            var drawingManager = new google.maps.drawing.DrawingManager({
                map: map,
                drawingControl: true,
                polygonOptions: {
                    strokeColor: '#FF8C00',
                    strokeOpacity: 0.8,
                    strokeWeight: 3,
                    fillColor: '#FFA500',
                    fillOpacity: 0.25
                },
                drawingControlOptions: {
                    position: google.maps.ControlPosition.TOP_RIGHT,
                    drawingModes: ['polygon', 'null']
                }

            });

            function valueFn(value) {
                return function () {
                    return value;
                };
            }

            function convertObjectToPathObj(objectlist) {
                var newlist = [];
                objectlist.forEach(function (latlngobj, ind) {
                    newlist.push({
                        "lat": valueFn(latlngobj.lat),
                        "lng": valueFn(latlngobj.lng)
                    });
                });
                return newlist;
            }
            var encodedBaseMesh, heading;

            function generate(data) {

                MC.generateFields(data).then(function (response) {
                    if (!!response.fields[0].error) {
                        var path = response.fields[0].error;
                        //path.push(path[0]);
                        console.log(path);
                        alert("Maximum waypoint count exceeded.");
                        $scope.infoWindow.close();
                        return;
                    } else {
                        var path = response.fields[0].baseMesh;
                        path.push(path[0]);
                        console.log(path);
                    }
                    var polygon = new google.maps.Data.Polygon([path]);
                    //polygon.setOptions({fillColor: '#FFA500', fillOpacity: 0});
                    $scope.map.data.add({
                        geometry: polygon
                    });
                    var lats = [],
                        lngs = [];
                    var baselatlon = path;
                    var baseMesh = convertObjectToPathObj(baselatlon);
                    encodedBaseMesh = google.maps.geometry.encoding.encodePath(baseMesh);
                    heading = response.fields[0].heading;
                    console.log(encodedBaseMesh);
                    console.log(response.fields[0].heading);
                });
            }

            var customEncodedBounds, bbox, blockdata;
            google.maps.event.addListener(drawingManager, 'polygoncomplete', function (event) {
                var path = event.getPaths().getAt(0).getArray();
                var area = google.maps.geometry.spherical.computeArea(path) * 0.000247105;
                var bounds = new google.maps.LatLngBounds();
                customEncodedBounds = google.maps.geometry.encoding.encodePath(path);
                var cusBounds = path.map(function (pt) {
                    return {
                        lat: pt.lat(),
                        lng: pt.lng()
                    };
                });
                var lats = [],
                    lngs = [];
                var i;
                for (i = 0; i < path.length; i++) {
                    bounds.extend(path[i]);
                }
                var center = bounds.getCenter();
                $scope.infoWindow = new google.maps.InfoWindow();

                var optionsStr = "";
                angular.forEach(MC.operations, function (operation, indx) {
                    optionsStr += '<option value=' + operation.opId + ' org=' + operation.org + '>' + operation.farmName + '</option>';
                });
                console.log(MC.operations);
                /* beautify preserve:start */
                var contentString = '<div class="customBlock" class="panel-body custom">' + '<table border="0" class="infoDropdown"><tbody>' + '<tr><td>' + '<select id="getOperationName">' + '<option value="-1">Please select...</option>' + optionsStr + '</select></td></tr>' + '<tr class="customBlockName"><td><input type="text" placeholder="Name"/></td></tr>' + '</tbody></table>' + '<table class="metadata"><tbody><tr><td>Area</td>' + '<td>' + area.toFixed(4) + ' Acres' + '</td>' + '</tr></tbody></table>' + '<div class="add-row-button pull-left col12 padT10">' + '<div class="pill col12">' + '<div class="pill col6">' + '<button class="icon-plus add pull-left col3"> Add property</button>' + '<button class="del col4">Delete</button>' + '</div>' + '<div class=" pull-right">' + '<button class="save col3 save">Save</button>' + '<button class="minor col3">Cancel</button>' + '</div>' + '</div>' + '</div>' + '</div>';
                //console.log(op);
                google.maps.event.addListener($scope.infoWindow, 'domready', function () {
                    var closeBtn, addBtn, saveBtn, delBtn, clr, minlat, maxlat, minlng, maxlng, bbox;
                    blockdata = {};
                    closeBtn = $('.minor').get();
                    addBtn = $('.add').get();
                    saveBtn = $('.save').get();
                    delBtn = $('.del').get();
                    clr = $('.clr-bounds').get();

                    google.maps.event.addDomListener(closeBtn[0], 'click', function () {
                        $scope.infoWindow.close();
                    });
                    google.maps.event.addDomListener(delBtn[0], 'click', function () {
                        $scope.infoWindow.close();
                        event.setMap(null);
                    });
                    google.maps.event.addDomListener(clr[0], 'click', function () {
                        $scope.infoWindow.close();
                        event.setMap(null);
                    });
                    google.maps.event.addDomListener(addBtn[0], 'click', function () {
                        var ele = d3.select('.metadata > tbody');
                        var tr = ele.append('tr');

                        tr.append('td').append('input').attr('type', 'text');

                        tr.append('td').append('input').attr('type', 'text');
                    });

                    google.maps.event.addDomListener(saveBtn[0], 'click', function () {
                        var cusBlock = $('.metadata').find('tr');
                        var selectedOperationId = $("#getOperationName").val();
                        //var selectedOperationName = $("#getOperationName option:selected").text();
                        var selectedOperationOrg = $("#getOperationName option:selected").attr('org');

                        angular.forEach(cusBlock, function (ele, index) {
                            var key, value;
                            var custds = $(ele).find('td');
                            var cusinp = $(custds).find('input');
                            if (cusinp.length) {
                                key = $.trim($(cusinp[0]).val());
                                value = $.trim($(cusinp[1]).val());
                            } else {
                                return;
                            }
                            if (key) {
                                blockdata[key] = value;
                            }
                        });
                        for (var i = 0; i < cusBounds.length; i++) {
                            lats.push(cusBounds[i].lat);
                            lngs.push(cusBounds[i].lng);
                        }
                        minlat = Math.min.apply(null, lats);
                        maxlat = Math.max.apply(null, lats);
                        minlng = Math.min.apply(null, lngs);
                        maxlng = Math.max.apply(null, lngs);
                        bbox = [minlng, minlat, maxlng, maxlat];
                        var cusBl = $('.infoDropdown').find('tr');
                        var cusName = $(cusBl).find('input');
                        var cusBlockName = $.trim($(cusName).val());
                        var cusBlock = {
                            "org-id": selectedOperationOrg,
                            "op-id": selectedOperationId,
                            "heading": heading,
                            "name": cusBlockName,
                            "bbox": bbox,
                            "properties": blockdata,
                            "boundary": customEncodedBounds,
                            "base-mesh": encodedBaseMesh
                        };
                        console.log(cusBlock);
                        MosaicDataService.createBlockFromGeoJSONFeatures(cusBlock);
                        //createBlockFromGeoJSONFeatures();
                        $scope.infoWindow.close();
                    });
                });

                /* beautify preserve:end */
                $scope.infoWindow.setContent(contentString);
                $scope.infoWindow.setPosition(center);
                $scope.infoWindow.open($scope.map);
                drawingManager.setDrawingMode(null);

                if (area < 300) {
                    generate({
                        farmId: 'abc123',
                        fields: [{
                            fieldName: new Date().toString(),
                            farmId: 'abc123',
                            boundary: path.map(function (pt) {
                                return {
                                    lat: pt.lat(),
                                    lng: pt.lng()
                                };
                            })
                        }]

                    });
                } else {
                    event.setMap(null);
                    $scope.infoWindow.close();
                    alert('Please select less than 300 acres!');
                }
            });

            var input = document.getElementById('autocomplete-input');
            var searchBox = new google.maps.places.SearchBox(input);
            $scope.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

            // Bias the SearchBox results towards current map's viewport.
            $scope.map.addListener('bounds_changed', function () {
                searchBox.setBounds($scope.map.getBounds());
            });

            // Listen for the event fired when the user selects a prediction and retrieve
            // more details for that place.
            searchBox.addListener('places_changed', function () {
                var places = searchBox.getPlaces();

                if (places.length === 0) {
                    return;
                }

                // For each place, get the icon, name and location.
                var bounds = new google.maps.LatLngBounds();
                places.forEach(function (place) {
                    if (place.geometry.viewport) {
                        // Only geocodes have viewport.
                        bounds.union(place.geometry.viewport);
                    } else {
                        bounds.extend(place.geometry.location);
                    }
                });
                $(input).val('');
                $(input).blur();
                $scope.map.fitBounds(bounds);
            });

            google.maps.event.addDomListener(window, "resize", handleResize);

            // map.data.loadGeoJson('/static/json/ranches/JulianaD15.geojson');
            // map.data.loadGeoJson('/static/json/ranches/JulianaD16.geojson');
            // map.data.loadGeoJson('/static/json/ranches/JulianaD17.geojson');
            // map.data.loadGeoJson('/static/json/ranches/JulianaFarming.geojson');

            map.data.setStyle({
                visible: true,
                zIndex: 10,
                fillColor: '#3399CC',
                fillOpacity: 0.1,
                strokeColor: '#3399CC'
            });
            initJson();
            var mapIconsIntv = null;
            var handleMapIcons = function handleMapIcons() {
                var imgsElms = document.querySelectorAll("img[src$='/mapfiles/drawing.png']");
                var imgLen = imgsElms.length;

                if (imgLen) {
                    if (mapIconsIntv != null) {
                        $interval.cancel(mapIconsIntv);
                    }

                    for (var i = 0; i < imgLen; i++) {
                        imgsElms[i].parentNode.setAttribute("class", "fa controllericon_" + i);
                        angular.element('.fa').parents().eq('2').parent().addClass('toolWrapper');
                        angular.element('#map > div').addClass('zIndex');
                    }

                    angular.element("#map-wrapper").css("visibility", "visible");
                    MC.show = false;
                }
            };

            google.maps.event.addListener(map, 'tilesloaded', function () {
                mapIconsIntv = $interval(handleMapIcons, 500);
            });
        }

        function setOperation(opId) {
            console.log(MC.operations, opId);
            // return;
            var operation = MC.operations[opId];
            $scope.currentOp = operation;
            $scope.detailOperation = operation;
            if (!!operation.bbox) MC.setBBox(operation.bbox);
            // var name = operation.op_name;
            // $scope.map.data.setStyle(function(feature){
            //     /** @type {google.maps.Data.StyleOptions} */
            //     var style = ({
            //         visible: true,
            //         zIndex: 10,
            //         fillColor:'#3399CC',
            //         fillOpacity: 0,
            //         strokeColor: '#3399CC'
            //     });
            //     // if (feature.getProperty('RANCH_1') === name){
            //     //     style.visible = true;
            //     //     style.fillColor = '#FFA500';
            //     //     style.strokeColor = '#FFA500';
            //     //     style.fillOpacity = 0;
            //     //     return style;
            //     // }
            //     return style;
            // });
        }

        function setFeature(feature) {
            MC.setBBox(feature.bbox);
        }

        function setBBox(bbox) {
            console.log(bbox);
            var bounds = function (_ref) {
                var _ref2 = _slicedToArray(_ref, 4);

                var west = _ref2[0];
                var south = _ref2[1];
                var east = _ref2[2];
                var north = _ref2[3];
                return {
                    west: west,
                    south: south,
                    east: east,
                    north: north
                };
            }(bbox);

            $scope.map.fitBounds(bounds);
        }

        function initJson() {
            $scope.infoWindow = new google.maps.InfoWindow();

            $scope.map.data.setStyle({
                visible: false,
                zIndex: 10,
                fillColor: '#3399CC',
                fillOpacity: 0,
                strokeColor: '#3399CC'
            });

            $scope.infoWindow.setZIndex(0);

            $scope.map.data.addListener('click', function (event) {
                var props = [];

                event.feature.forEachProperty(function (val, key) {
                    var prop = {};
                    prop.key = key;
                    prop.val = val ? val : '-';
                    props.push(prop);
                });

                var contentString = '<div id="infoWindowContent" style="max-height:350px;min-width:200px;overflow-y:auto;"></div>';

                $scope.infoWindow.setContent(contentString);
                $scope.infoWindow.setPosition(event.latLng.toJSON());
                $scope.blockData = {
                    data: props
                };
                $scope.infoWindow.open($scope.map);
            });

            $scope.infoWindow.addListener('domready', function () {
                var tpl = '<ng-include src="\'/templates/map.infowindow.partial.html\'" id="infoWindowWrap"></ng-include>';
                $('#infoWindowContent').empty();
                $('#infoWindowContent').append($compile(tpl)($scope));
                $scope.$apply();
                $timeout(function () {
                    $scope.infoWindow.setZIndex(4);
                }, 20, false);
            });

            $scope.infoWindow.addListener('closeclick', function () {
                google.maps.event.clearListeners('domready', $scope.infoWindow);
            });
        }

        function loadTiles(selectedBatch, selectedType) {
            console.log(selectedBatch, selectedType);
            TileService.loadTiles(selectedBatch, selectedType, $scope.map);
        };

        function showFieldPopup(o) {
            return function (event) {
                var area = google.maps.geometry.spherical.computeArea(o.getPath()) * 0.000247105;
                /* beautify preserve:start */
                var contentString = '<h5>' + o.fieldName + '</h5><br>' + '<div class="panel-body" style="width:270px;padding:0px;"><dl class="dl-horizontal" style="width:250px;">' + '<dt style="width:100px;"><b>Clicked location:</b></dt>' + '<dd style="margin-left:120px;">' + '[' + event.latLng.lat().toFixed(6) + ',' + event.latLng.lng().toFixed(6) + ']' + '</dd>' + '<dt style="width:100px;"><b>Area:</b></dt>' + '<dd style="margin-left:120px;">' + area.toFixed(4) + ' Acres' + '</dd></dl>' + '<button type="button" id="deactivator">Deactivate Field</button></div>';
                /* beautify preserve:end */
                $scope.infoWindow.setContent(contentString);
                $scope.infoWindow.setPosition(event.latLng);
                $scope.infoWindow.open($scope.map);
            };
        };

        function confirmField(newfieldname) {
            console.log(newfieldname);
            $scope.fieldInProgress.store(String(newfieldname));
            $scope.savedFields.push($scope.fieldInProgress);
            $scope.fieldInProgress = null;
            $scope.markerId = 0;
            $scope.markers.forEach(function (m) {
                m.setMap(null);
            });
            $scope.markers = [];
            $scope.reset();
        };

        function generateFields(data) {

            //           console.log('fields confirming');
            //           var farmToSubmit = {};
            //           farmToSubmit.farmId = '';//$scope.currentFarm.id;
            //           farmToSubmit.fields = [];
            //           var thePolygons = $scope.savedFields;
            //           thePolygons.forEach(function(p, i) {
            //               var f = {};
            //               f.createdOn = p.createdOn_;
            //               f.fieldName = p.fieldName_;
            //               f.active = true;
            //               console.log(f.fieldName);
            //               f.boundary = [];
            //               var bound = p.getPath();
            //               bound.forEach(function(b, j) {
            //                   var n = {};
            //                   n.lat = b.lat();
            //                   n.lng = b.lng();
            //                   n.ind = j;
            //                   f.boundary.push(n);
            //               });
            //               farmToSubmit.fields[i] = f;
            //           });
            //            console.log(data);
            //           return $q.when();
            return UserService.generateFields(data);
            //console.log(data.fields[0].boundary);
        };
    };
})();
'use strict';

(function () {
    angular.module('skyApp.mosaic').config(['$stateProvider', '$urlRouterProvider', configureStates]).run(['$rootScope', function ($rootScope, $state) {
        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            $rootScope.state = toState;
        });
    }]);

    function configureStates($stateProvider, $urlRouterProvider) {

        $stateProvider.state('home', {
            url: '',
            views: {
                '@': {
                    templateUrl: 'templates/root/root.view.html'
                },
                'header@home': {
                    templateUrl: 'templates/root/header.html',
                    controller: 'HeaderController',
                    controllerAs: 'hc'
                },
                'nav@home': {
                    templateUrl: 'templates/root/nav.view.html',
                    controller: 'NavController',
                    controllerAs: 'nc',
                    resolve: {
                        'org': ['UserService', 'MosaicDataService', function (UserService, MosaicDataService) {
                            return UserService.getOrg().then(function (org) {
                                MosaicDataService.setOrg(org.orgId);
                                return org;
                            });
                        }]
                    }
                },
                'tabs@home': {
                    template: '<div ng-class="{true:\'apptour\'}[onTour]">' + '<md-tabs class="tabs-top" md-no-ink md-selected="selectedTab">' + '<md-tab class="md-primary" ng-repeat="tab in tabs" ng-click="onTabSelected(tab.sref)">' + '<md-tab-label>' + '<div ng-if="tab.name != \'Tour\'">' + '<div class="menulabelstyle" wt-step="{{2 + $index}}" wt-group="tour" wt-position="bottom">' + '{{tab.name}}' + '<wt-step-content>' + '<div ng-bind-html="tab.description"></div>' + '</wt-step-content>' + '</div>' + '</div>' + '<div class="menulabelstyle" ng-if="tab.name == \'Tour\'">' + '{{tab.name}}' + '</div>' + '</md-tab-label>' + '</md-tab>' + '</md-tabs></div>',
                    controller: ['$scope', '$state', 'UserService', 'MosaicDataService', '$rootScope', function ($scope, $state, UserService, MosaicDataService, $rootScope) {
                        $rootScope.onTour = false;

                        $rootScope.$on("TOUR_END", function () {
                            $rootScope.onTour = false;
                        });

                        $scope.onTabSelected = function (tab) {
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
                            description: 'If you don\'t have shape files then select the \'Add Farm\' on the side navigation and enter the farm name with address.</br>' + '</br>' + 'You can add a new block to the farm using google map drawing tool. Please select the hamburger menu on top right corener of map and select the polygon tool to draw the boundaries.</br>' + '<br /> Click <strong>Next</strong> to continue the tour.'
                        }, {
                            name: 'Flights',
                            sref: 'home.flights',
                            routename: '/flights',
                            description: 'Flights will give you the information about your flight\'s mission like Altitude, Start time and Duration.</br>' + ' You can also download the NDVI images in PNG,PDF,SHP,TIF formats.</br>' + '<br /> Click <strong>Next</strong> to continue the tour.'

                        }, {
                            name: 'Weather',
                            sref: 'home.weather',
                            routename: '/weather',
                            description: ' Weather will give you the updates on forecast like min-temp / max-temp, precipitation, windispeed, cloud cover etc..</br>' + 'Currently the page is under construction.</br>' + 'Please visit back for more updates.</br>' + '<br /> Click <strong>Next</strong> to continue the tour.'
                        }, {
                            name: 'Upload',
                            sref: 'home.upload',
                            routename: '/upload',
                            description: 'If you have the shape files ready then please upload here and we will notify you the process time and results.</br>' + '<br /> Click <strong>Next</strong> to continue the tour.'
                        }, {
                            name: 'My farm',
                            sref: 'home.myfarm',
                            routename: '/myfarm',
                            description: ' Are you NEW to Skycision?</br>' + 'Then TOUR will navigate you. </br>' + '<br /> Click <strong>Next</strong> to continue the tour.'
                        }, {
                            name: 'Tour',
                            sref: 'home.tour',
                            routename: '/tour',
                            description: ' Are you NEW to Skycision?</br>' + 'Then TOUR will navigate you. </br>' + '<br /> Click <strong>Next</strong> to continue the tour.'
                        }];

                        var tabIndex = ctrl.tabs.indexOf(ctrl.tabs.filter(function (t) {
                            return $state.includes(t.sref);
                        })[0]);

                        angular.extend($scope, {
                            selectedTab: tabIndex === -1 ? 0 : tabIndex,
                            tabs: ctrl.tabs
                        });

                        MosaicDataService.getOperations().then(function (ops) {
                            return ops.reduce(function (p, c) {
                                return p[c.opId] = c, p;
                            }, {});
                        }).then(function (opsMap) {
                            $scope.ops = opsMap;
                        });
                    }]
                },
                'main@home': {
                    templateUrl: 'templates/root/main.html',
                    controller: 'MainController',
                    controllerAs: 'mc',
                    resolve: {
                        'theOperations': ['MosaicDataService', function (MosaicDataService) {
                            return MosaicDataService.getOperations().then(function (ops) {
                                return ops.reduce(function (p, c) {
                                    p[c.opId] = c;
                                    return p;
                                }, {});
                            });
                        }]
                    }
                }
            },
            redirectTo: 'home.map',
            data: {
                uploaderTarget: 'nav-uploader',
                sliderOpen: false
            }
        }).state('home.map', {
            name: 'map',
            url: '/map',
            data: {
                sliderOpen: false
            }
        }).state('home.map.detail', {
            name: 'home.map.detail',
            url: '/{detail}',
            views: {
                'detail': {
                    template: '',
                    controller: ['$scope', '$stateParams', 'MosaicDataService', function ($scope, $stateParams, MDS) {
                        $scope.setDetailOperation($stateParams.detail);
                    }]
                }
            }
        });
    }
})();
'use strict';

(function () {

    angular.module('skyApp.myfarm', ['ngAnimate', 'ngSanitize', 'rzModule', 'ui.bootstrap']);
})();
'use strict';

(function () {
    angular.module('skyApp.myfarm').controller('myfarmController', myfarmController);

    myfarmController.$inject = ['$scope', '$state', '$rootScope'];

    function myfarmController($scope, $state, $rootScope) {
        $scope.oneAtATime = true;

        // $scope.status = {
        //     isFirstOpen: true,
        //     isFirstDisabled: false
        // };

        $scope.defaultCropLifeOptions = [{
            name: 'Prune',
            id: 'PRUNE'
        }, {
            name: 'Plant',
            id: 'PLANT'
        }, {
            name: 'Harvest',
            id: 'HARVEST'
        }];

        $scope.fields = [{
            "name": "Field 5",
            "acres": "36 acres",
            "crop": "Oranges",
            selectedcroplife: ''
        }, {
            "name": "Field 4",
            "acres": "36 acres",
            "crop": "Oranges",
            selectedcroplife: ''
        }, {
            "name": "Field 3",
            "acres": "34 acres",
            "crop": "Oranges",
            selectedcroplife: ''
        }, {
            "name": "Field 2",
            "acres": "39 acres",
            "crop": "Oranges",
            selectedcroplife: ''
        }, {
            "name": "Field 1",
            "acres": "31 acres",
            "crop": "Oranges",
            selectedcroplife: ''
        }];

        $scope.slider_ticks = {
            value: 0,
            options: {
                ceil: 11,
                floor: 0,
                showTicks: true,
                translate: function translate(value) {
                    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    return months[value];
                }
            }
        };
        $scope.saveField = function (fieldObj) {
            //alert(JSON.stringify(fieldObj))
        };
        //Calendar

        $scope.today = function () {
            $scope.dt = new Date();
        };
        $scope.today();

        $scope.clear = function () {
            $scope.dt = null;
        };

        $scope.inlineOptions = {
            customClass: getDayClass,
            minDate: new Date(),
            showWeeks: true
        };

        $scope.dateOptions = {
            //dateDisabled: disabled,
            formatYear: 'yy',
            maxDate: new Date(2020, 5, 22),
            minDate: new Date(),
            startingDay: 1
        };

        $scope.toggleMin = function () {
            $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
            $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
        };

        $scope.toggleMin();

        $scope.open1 = function () {
            $scope.popup1.opened = true;
        };

        $scope.open2 = function () {
            $scope.popup2.opened = true;
        };

        $scope.setDate = function (year, month, day) {
            $scope.dt = new Date(year, month, day);
        };

        $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
        $scope.format = $scope.formats[0];
        $scope.altInputFormats = ['M!/d!/yyyy'];

        $scope.popup1 = {
            opened: false
        };

        $scope.popup2 = {
            opened: false
        };

        var tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        var afterTomorrow = new Date();
        afterTomorrow.setDate(tomorrow.getDate() + 1);
        $scope.events = [{
            date: tomorrow,
            status: 'full'
        }, {
            date: afterTomorrow,
            status: 'partially'
        }];

        function getDayClass(data) {
            var date = data.date,
                mode = data.mode;
            if (mode === 'day') {
                var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

                for (var i = 0; i < $scope.events.length; i++) {
                    var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);

                    if (dayToCheck === currentDay) {
                        return $scope.events[i].status;
                    }
                }
            }

            return '';
        }
    }
})();
'use strict';

(function () {
    angular.module('skyApp.myfarm').config(['$stateProvider', '$urlRouterProvider', configureStates]);

    function configureStates($stateProvider, $urlRouterProvider) {

        $stateProvider.state('home.myfarm', {
            name: 'home.myfarm',
            url: '/myfarm',
            views: {
                'content': {
                    templateUrl: 'templates/myfarm/myfarm-view.html',
                    controller: 'myfarmController'
                }
            },
            data: {
                sliderOpen: true,
                contentWidth: 100
            }
        });
    }
})();
'use strict';

(function () {
    angular.module('skyApp.root', []);
})();
'use strict';

(function () {
    angular.module('skyApp.root').controller('HeaderController', HeaderController);

    HeaderController.$inject = ['$scope', '$state', 'UserService', 'AuthService', '$mdSidenav'];
    function HeaderController($scope, $state, UserService, AuthService, $mdSidenav) {
        var hc = this;
        activate();
        hc.openMenu = function () {
            $mdSidenav('left').toggle();
        };
        angular.extend($scope, {
            go: go,
            isActive: isActive,
            signOut: signOut
        });

        function activate() {
            UserService.getUser().then(function (user) {
                angular.extend($scope, { user: user });
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
'use strict';

(function () {
    angular.module('skyApp.root').constant('jQuery', window.jQuery).controller('NavController', ['$scope', 'MosaicDataService', 'jQuery', 'org', '$mdSidenav', '$mdDialog', '$mdMedia', NavController]);

    function NavController($scope, MDS, $, org, $mdSidenav, $mdDialog, $mdMedia) {
        var NC = this;

        NC.activate = activate;
        NC.activate();

        function activate() {
            $scope.org = org;
            MDS.getOperations(org.orgId).then(function (operations) {
                //console.log(operations.map(function (arg){return arg.opId}));
                $scope.ops = operations;
            });
        }
        var mainContent = $('.cd-main-content'),
            header = $('.cd-main-header'),
            sidebar = $('.cd-side-nav'),
            mblTabs = $('.nav-tabs'),
            sidebarTrigger = $('.cd-nav-trigger'),
            topNavigation = $('.cd-top-nav'),
            searchForm = $('.cd-search'),
            accountInfo = $('.account'),
            headerHeight = $('.cd-main-header').height();

        $('.has-children > a').on('click', function (event) {
            var selectedItem = $(this);
            // event.preventDefault();
            $('.fa-chevron-down').removeClass('fa-chevron-down');
            if (selectedItem.parent('li').hasClass('selected')) {
                selectedItem.parent('li').removeClass('selected');
            } else {
                sidebar.find('.has-children.selected ').removeClass('selected');
                accountInfo.removeClass('selected');
                selectedItem.parent('li').addClass('selected');
                selectedItem.find('.fa-chevron-right').addClass('fa-chevron-down');
            }
        });
        $scope.showAdvanced = function (ev) {
            // var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
            $mdDialog.show({
                controller: ["$scope", "$mdDialog", DialogController],
                templateUrl: 'templates/users.create-farm.view.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true
            });
            //     .then(function(answer) {
            //         $scope.status = 'You said the information was "' + answer + '".';
            //     }, function() {
            //         $scope.status = 'You cancelled the dialog.';
            //     });
            // $scope.$watch(function() {
            //     return $mdMedia('xs') || $mdMedia('sm');
            // }, function(wantsFullScreen) {
            //     $scope.customFullscreen = (wantsFullScreen === true);
            // });
        };

        //fullscreen: useFullScreen
        function DialogController($scope, $mdDialog) {

            $scope.cancel = function () {
                $mdDialog.cancel();
            };
        }
    }
})();
'use strict';

(function () {
    angular.module('skyApp.root').config(['$stateProvider', '$urlRouterProvider', '$urlMatcherFactoryProvider', configRootStates]);

    function configRootStates($stateProvider, $urlRouterProvider, $urlMatcherFactoryProvider) {
        // $urlMatcherFactoryProvider.strictMode(false)

        $urlRouterProvider.otherwise('/login');
        // $urlRouterProvider.otherwise(function($injector) {
        //     var $state = $injector.get("$state");
        //     $state.go("login");
        // });

        $stateProvider.state('login', {
            name: 'login',
            url: '/login',
            templateUrl: 'templates/signup/signup-view.html',
            controller: 'SignupController',
            controllerAs: 'sc'
        });

        // .state('header', {

        //     templateUrl: 'header.html',
        //     controller: 'HeaderController',
        //     controllerAs: 'hc',
        //     parent: 'root'
        // })

        // .state('main', {
        //     templateUrl: 'templates/main.html',
        //     controller: 'MainController',
        //     controllerAs: 'mc',
        //     parent: 'root'
        // })

        // .state('signup', {
        //     url:'/signup',
        //     controller: 'SignupController',
        //     controllerAs: 'sc',
        //     templateUrl: 'templates/signup-view.html'
        // })

        // stateHelperProvider
        // .state({
        //     name: 'root',
        //     url: '/',
        //     templateUrl: 'templates/root/root.view.html',
        //     views: [{
        //         name: 'root.header',
        //         controller: HeaderController,
        //         controllerAs: 'hc',
        //         templateUrl: 'app/header.html'
        //     },{
        //         name: 'root.main',
        //         // url: '/main',
        //         controller: 'MainController',
        //         controllerAs: 'mc',
        //         templateUrl: 'app/main.html'
        //     }]
        // })         
    }
})();
'use strict';

(function () {

  angular.module('skyApp.signup', []);
})();
'use strict';

(function () {

    angular.module('skyApp.signup').controller('SignupController', ['$scope', '$q', 'AuthService', '$mdDialog', 'UserService', SignupController]).directive('confirmPassword', passwordMatch);

    function passwordMatch() {

        return {
            restrict: 'A',
            require: 'ngModel',
            scope: {
                confirmPassword: '=confirmPassword'
            },
            link: function link(scope, element, attributes, ngModel) {
                ngModel.$validators.confirmPassword = function (modelValue) {
                    return modelValue === scope.confirmPassword;
                };

                scope.$watch('confirmPassword', function () {
                    ngModel.$validate();
                });
            }
        };
    }

    function SignupController($scope, $q, AuthService, $mdDialog, UserService) {
        // so I don't get confused...
        var sc = this;
        sc.show = true;
        $scope.loading = false;
        // Primary Methods
        sc.signIn = signIn;
        sc.registerUser = registerUser;

        sc.validateForm = function (account) {
            if ($scope.form.$valid) {
                sc.registerUser(account);
            }
        };

        sc.resetPassword = resetPassword;
        sc.verifyEmail = verifyEmail;
        sc.confirmResetPassword = confirmResetPassword;

        // UI Methods
        sc.onEscKeyUp = onEscKeyUp;
        sc.togglePasswordShow = togglePasswordShow;
        sc.setMode = setMode;

        sc.registeredUser = null;
        sc.forgotPasswordUser = null;

        var formModal = $('.cd-user-modal'),
            formLogin = formModal.find('#cd-login'),
            formVerify = formModal.find('#cd-verify'),
            formSignup = formModal.find('#cd-signup'),
            formForgotPassword = formModal.find('#cd-reset-password'),
            formModalTab = $('.cd-switcher'),
            tabLogin = formModalTab.children('li').eq(0).children('a'),
            tabSignup = formModalTab.children('li').eq(1).children('a'),
            forgotPasswordLink = formLogin.find('.cd-form-bottom-message a'),
            backToLoginLink = formForgotPassword.find('.cd-form-bottom-message a'),
            formTermsCond = formModal.find('#cd-termsCond'),
            mainNav = $('.main-nav'),
            formConfirmReset = $('#cd-confirm-reset');

        function signIn(user) {
            AuthService.authenticateUser(user.username, user.password).then(function (success) {
                console.log('success', success);
                $scope.loading = true;
            }, function (failure) {
                console.log('failure', failure);
                //alert(failure);
                $scope.loading = false;
            });
        }

        function registerUser(account) {

            var otherParams = {
                "family_name": account.familyName,
                "given_name": account.given_name,
                "address": account.address,
                "email": account.email.toLowerCase()
            };
            AuthService.registerUser(account.username, account.password, otherParams).then(function (result) {
                console.log('success', result);
                sc.registeredUser = result;
                formLogin.removeClass('is-selected');
                formSignup.removeClass('is-selected');
                formVerify.addClass('is-selected');
                formModal.find('.cd-switcher').addClass('hide');
                tabLogin.removeClass('selected');
                tabSignup.removeClass('selected');
                $scope.loading = true;
            }, function (failure) {
                console.log('failure', failure);
                $scope.loading = false;
            });
        }

        function resetPassword(email) {
            sc.forgotPasswordUser = AuthService.resetPassword(email).then(function (user) {
                sc.setMode(4);
                return user;
            }, function () {
                alert("Error");
            });
        }

        function confirmResetPassword(confirmation) {
            sc.forgotPasswordUser.then(function (user) {
                if (!user) {
                    console.log('user is falsy');
                }
                user.client.confirmForgotPassword({
                    ClientId: user.pool.getClientId(),
                    Username: user.username,
                    ConfirmationCode: confirmation.code,
                    Password: confirmation.password
                }, function (err, data) {
                    if (err) {
                        console.log(arguments);
                        alert(err);
                        return;
                    }
                    alert('Success! Please login with your new password');
                    sc.setMode(0);
                });
            });
        }

        function verifyEmail(code) {
            AuthService.confirmRegistration(sc.registeredUser, code).then(function (success) {
                alert('Success!');
                sc.setMode(0);
            }, function (error) {
                alert('Failure!');
            });
        }

        //close modal when clicking the esc keyboard button
        function onEscKeyUp($event) {
            if ($event.keyCode == '27') {
                formModal.removeClass('is-visible');
            }
        }

        //hide or show password
        function togglePasswordShow($event) {
            var togglePass = angular.element($event.target),
                passwordField = togglePass.prev('input');

            'password' == passwordField.attr('type') ? passwordField.attr('type', 'text') : passwordField.attr('type', 'password');
            'Hide' == togglePass.text() ? togglePass.text('Show') : togglePass.text('Hide');
            //focus and move cursor to the end of input field
            putCursorAtEnd(passwordField);
        }

        // switch between nothing, signin, register, and forgot modes
        function setMode(val) {
            switch (val) {
                case -1:
                    formModal.removeClass('is-visible');
                    break;
                case 0:
                    mainNav.children('ul').removeClass('is-visible');
                    formModal.addClass('is-visible');
                    formLogin.addClass('is-selected');
                    formSignup.removeClass('is-selected');
                    formForgotPassword.removeClass('is-selected');
                    tabLogin.addClass('selected');
                    tabSignup.removeClass('selected');
                    formModal.find('.cd-switcher').removeClass('hide');
                    formVerify.removeClass('is-selected');
                    formTermsCond.removeClass('is-selected');
                    formConfirmReset.removeClass('is-selected');

                    break;
                case 1:
                    mainNav.children('ul').removeClass('is-visible');
                    formModal.addClass('is-visible');
                    formLogin.removeClass('is-selected');
                    formSignup.addClass('is-selected');
                    formForgotPassword.removeClass('is-selected');
                    tabLogin.removeClass('selected');
                    tabSignup.addClass('selected');
                    formTermsCond.removeClass('is-selected');
                    formConfirmReset.removeClass('is-selected');
                    break;
                case 2:
                    formLogin.removeClass('is-selected');
                    formSignup.removeClass('is-selected');
                    formForgotPassword.addClass('is-selected');
                    formTermsCond.removeClass('is-selected');
                    break;
                case 3:
                    formSignup.removeClass('is-selected');
                    formTermsCond.addClass('is-selected');
                    break;
                case 4:
                    formForgotPassword.removeClass('is-selected');
                    formConfirmReset.addClass('is-selected');
                    break;
            }
        }

        //IE9 placeholder fallback
        //credits http://www.hagenburger.net/BLOG/HTML5-Input-Placeholder-Fix-With-jQuery.html
        if (!Modernizr.input.placeholder) {
            $('[placeholder]').focus(function () {
                var input = $(this);
                if (input.val() == input.attr('placeholder')) {
                    input.val('');
                }
            }).blur(function () {
                var input = $(this);
                if (input.val() == '' || input.val() == input.attr('placeholder')) {
                    input.val(input.attr('placeholder'));
                }
            }).blur();
            $('[placeholder]').parents('form').submit(function () {
                $(this).find('[placeholder]').each(function () {
                    var input = $(this);
                    if (input.val() == input.attr('placeholder')) {
                        input.val('');
                    }
                });
            });
        }
    }

    //credits http://css-tricks.com/snippets/jquery/move-cursor-to-end-of-textarea-or-input/
    function putCursorAtEnd(target) {
        return target.each(function () {
            // If this function exists...
            if (target.setSelectionRange) {
                // ... then use it (Doesn't work in IE)
                // Double the length because Opera is inconsistent about whether a carriage return is one character or two. Sigh.
                var len = $(target).val().length * 2;
                target.focus();
                target.setSelectionRange(len, len);
            } else {
                // ... otherwise replace the contents with itself
                // (Doesn't work in Google Chrome)
                $(target).val($(target).val());
            }
        });
    }
})();
'use strict';

(function () {

    angular.module('skyApp.signup').controller('termsController', termsController).run(['$templateCache', setTemplate]);

    termsController.$inject = ['$scope', '$uibModalInstance'];

    function termsController($scope, $uibModalInstance) {
        // $scope.close = function() {
        //     $uibModalInstance.close();
        // }
    }

    function setTemplate($templateCache) {
        $templateCache.put('/templates/signup-terms.partial.html', '<div id="termsCond" class="modal-body">' + '<div id="terms" class="cd-form">' + '<div id="terms-header">' + '<div class="pull-right cross">' + '<a href="" ng-click="cancel()"><i class="fa fa-times-circle-o" aria-hidden="true"></i></a>' + '</div>' + '<div id="start" class="headText">' + '<h3>Skycision Terms &amp; Conditions</h3></div>' + '</div>' + '<div id="terms-body">' + '<p><strong>SKYCISION LICENSE, TRAINING AND SUPPORT.</strong></p>' + '<p>' + '<strong>General.</strong> Subject to the terms and conditions of this Agreement, Customer can download the Skycision mobile device application (the "<u>Application</u>") for the purpose of accessing Skycision content and services, including without limitation, the analysis of aerial imagery provided by Skycision (collectively, such content and services, together with the Application, are referred to herein as the “<u>Services</u>”). Skycision will also store the Customer Data (as defined herein) on the servers. Subject to certain rights granted to Skycision herein, all rights, title and interest in and to the Customer Data shall remain the property of Customer and shall be deemed the Confidential Information (as defined herein) of Customer. The Services are subject to modification from time to time at the sole discretion of Skycision for any purpose deemed appropriate by Skycision, including, without limitation, adding new functionality or increasing operating efficiency. "<u>Customer Data</u>" means any information, records, images and/or data that Customer provides to Skycision via the Services.' + '</p>' + '<p>' + '<strong>License.</strong> Subject to the terms and conditions of this Agreement, commencing on the date specified in a term sheet or that the Customer accepts these terms and conditions (the "Effective 1 Date"), Skycision hereby grants to Customer a limited, non-exclusive, non-transferable license without the right to sublicense during the Term of this Agreement, to access the Services solely for Customer\'s internal use.' + '</p>' + '<p>' + '<strong>Availability.</strong> Skycision reserves the right to suspend Customer\'s access to the Services for maintenance, and in the event that the Customer is in breach of this Agreement.' + '</p>' + '<p>' + '<strong>Restrictions.</strong> Customer acknowledges that Customer has no right, title or interest in or to the Services other than the rights of use described in Section 1.2 above. Customer shall not, and shall not permit a third party to: (i) copy, download, provide screen prints, modify, transfer or assign the Services, or any copy, adaptation, transcription or merged portion thereof, (ii) reverse engineer, decompile, reverse-compile, translate, disassemble or reverse assemble the Services or the source code or object code for all or any portion of the Services, (iii) use the Services for any purpose other than its intended purpose, (iv) use the Services to process data for any third party (except as intended herein or otherwise permitted in the Documentation); (v) use or permit the use of the Services to operate a service bureau, (vi) sell, lease, assign, sublicense or otherwise transfer or disclose the Services in whole or in part, to any third party, including, without limitation, any parent, subsidiary or other affiliated entity of Customer; or (vii) allow access to the Services to any third party (whether directly or through the use of Customer\'s password).' + '</p>' + '<p>' + '<strong>Documentation.</strong> The Customer acknowledges and agrees that all documentation<sup>2</sup> provided by Skycision pertaining to the use of the Services (the "Documentation") shall be deemed to be the Confidential Information (as defined herein) of Skycision and shall not be disclosed to any third party. Skycision may update the Documentation at any time by providing notice to Customer.' + '</p>' + '<p>' + '<strong>Support.</strong> Skycision shall provide the Customer with support as provided in the Documentation' + '</p>' + '<p>' + '<strong>CUSTOMER\'S OBLIGATIONS.</strong>' + '</p>' + '<p>' + '<strong>Customer-Supplied Equipment.</strong> Except for the Services, Customer shall be responsible for obtaining and maintaining all communications facilities, Internet connectivity, third-party equipment, hardware and software necessary to connect to and operate the Services (the "CustomerSupplied Equipment"). Customer\'s access to the Services may be affected (without liability to Skycision) by the Internet being down, failure of Customer to provide all Customer-Supplied Equipment, failure of any Customer-Supplied Equipment to be operating properly, failure of the Customer to be connected to the Internet, or Customer\'s breach of any of the terms and conditions of this Agreement. Customer shall be solely responsible for all charges incurred by Customer in the use of the Services (including without limitation all costs for use of the CustomerSupplied Equipment).' + '</p>' + '<p>' + '<strong>Customer Data Compliance.</strong> Customer is responsible for ensuring that Customer, and its authorized users, complies with Customer\'s obligations under this Agreement. Customer will observe all of its obligations under all relevant privacy and data protection laws or regulations and all local, state and federal regulations and laws, including without limitation all Federal Aviation Administration regulations, in its use of the Services, Customer Data, and Customer-Supplied Equipment (including operation of the drones).' + '</p>' + '<p>' + '<strong>General.</strong> Customer shall cooperate with Skycision in connection with the performance of this Agreement, including, without limitation, in establishing a password or other procedures for verifying that only employees or consultants of Customer have access to the Services.' + '</p>' + '<p>' + '<strong>Indemnity for Customer Data.</strong> Customer will defend, indemnify and hold Skycision harmless against any third party claims, losses, or damages arising from or relating to: (a) Customer Data; or (b) violations of law or regulation by Customer relating to Customer Data or Customer\'s use of the Customer-Supplied Equipment. Skycision will (i) provide Customer with notice of the claim within a reasonable period of time after learning of the claims; and (ii) reasonably cooperate in response to Customer\'s requests for assistance. Customer may not settle or compromise any indemnified claim without Skycision\'s prior written consent.' + '</p>' + '<p>' + '<strong>Third Party Legal Terms Incorporated by Reference.</strong>' + '</p>' + '<p>' + '<strong>Apple.</strong> In addition to terms and conditions set forth elsewhere in this Agreement, Apple, Inc. ("Apple") also requires that this Agreement between Skycision and Customer include the following:' + '</p>' + '<p>' + '<i>Acknowledgement.</i> Skycision and Customer each hereby acknowledge that this Agreement is concluded between Skycision and Customer, and not with Apple. Skycision, not Apple, is solely responsible for the Application licensed hereunder and the content thereof.' + '</p>' + '<p>' + '<i>Maintenance and Support.</i> Skycision is solely responsible for providing maintenance and support services with respect to the Application as required under applicable law, if any. Skycision and Customer each hereby acknowledge that Apple has no obligation whatsoever to furnish any maintenance and support services with respect to the Application' + '</p>' + '<p>' + '<i>Warranty.</i> Skycision shall be solely responsible for any product warranties not effectively disclaimed hereunder. Notwithstanding anything to the contrary herein, and without limiting the disclaimers and limitations set forth in Sections 7 and 8 below, in the event of any failure of the Application to conform to any such applicable warranty, Customer may notify Apple, and Apple will refund the purchase price for the Application to Customer. To the maximum extent permitted by applicable law, Apple will have no other warranty obligation whatsoever with respect to the Application, and any other claims, losses, liabilities, damages, costs or expenses attributable to any failure to conform to any warranty will be Skycision\'s sole responsibility.' + '</p>' + '<p>' + '<i>Product Claims.</i> To the extent Customer, or any third party, has any claims relating to the Application or Customer\'s possession and/or use of the Application including, but not limited to: (i) product liability claims; (ii) any claim that the Application fails to conform to any applicable legal or regulatory requirement; and (iii) claims arising under consumer protection or similar legislation, Customer and Skycision each acknowledge that Skycision, not Apple, is responsible for addressing any such claims, subject to the terms and conditions set forth in this Agreement and subject to applicable law.' + '</p>' + '<p>' + '<i>Intellectual Property Rights.</i> In the event of any third party claim that the Application or Customer\'s possession and use of that licensed Application infringes that third party’s intellectual property rights, as between Skycision and Apple, it is Skycision, not Apple, who will be solely responsible for the investigation, defense, settlement and discharge of any such intellectual property infringement claim arising under this Agreement or applicable law.' + '</p>' + '<p>' + '<i>Legal Compliance.</i> Customer hereby represents and warrants that (i) Customer is not located in a country that is subject to a U.S. Government embargo, or that has been designated by the U.S. Government as a “terrorist supporting” country; and (ii) Customer is not listed on any U.S. Government list of prohibited or restricted parties.' + '</p>' + '<p>' + '<i>Developer Name and Address.</i> All end-user questions, complaints or claims with respect to the Application should be directed to Skycision, via e-mail at [brendan.carroll@skycision.com].' + '</p>' + '<p>' + '<i>Third Party Terms of Agreement.</i> Customer must comply with applicable third party terms of agreement when using the Application.' + '</p>' + '<p>' + '<i>Third Party Beneficiary.</i> Customer and Skycision each acknowledge and agree that Apple, and Apple’s subsidiaries, are third party beneficiaries of this Agreement, and, upon Customer\'s acceptance of the terms and conditions of this Agreement, Apple will have the right (and will be deemed to have accepted the right) to enforce this Agreement against Customer as a third party beneficiary to this Agreement.' + '</p>' + '<p>' + '<strong><u>Google Maps/Google Earth.</u></strong> The Services rely on the Google Maps/Earth service provided by Google, Inc. ("<u>Google</u>"). By using the Services, Customer agrees and acknowledges that use of Google Maps/Earth functionality integrated into the Services is subject to the Google Maps/Earth Terms of Service (' + '<u><a href="https://developers.google.com/maps/terms#section_9_1" target="_blank">https://developers.google.com/maps/terms#section_9_1</a></u>) and Privacy Policy' + '<a href="http://www.google.com/policies/privacy" target="_blank">http://www.google.com/policies/privacy</a>.' + '</p>' + '<p>' + '<strong>PAYMENT.</strong>' + '</p>' + '<p>' + '<strong>Fees.</strong> Payment of all undisputed fees and expenses pursuant to Skycision\'s invoices (the "<u>Fees</u>") will be due and payable prior to the commencement of each Term. Customer will pay all undisputed amounts due under Skycision’s invoices in U.S. currency, free of any and all currency controls or other restrictions. If the Agreement is terminated by Customer as a result of Skycision\'s breach, Customer shall receive a prorata refund of prepaid Fees for the unused, posttermination portion of the then-current Term. Skycision does not store or maintain Customer\'s credit card information but instead contracts with a third party payment processor to collect and process Customer\'s payment information.' + '</p>' + '<p>' + '<strong>Late Payments.</strong> If the Customer fails to pay an invoice in a timely manner, all such invoices will bear interest at the rate of one and one-half percent (1.5%) per month, or the maximum rate allowed by law, whichever is less. Skycision shall be entitled to recover its costs and expenses incurred in collecting any amounts due hereunder, including reasonable attorneys\' fees. In addition to any other remedy available, Skycision may restrict or suspend Customer\'s access to the Services if payment is not made when due.' + '</p>' + '<p>' + '<strong>Taxes.</strong> Fees under this Agreement are exclusive of all taxes, including national, state or provincial and local use, sales, property and similar taxes, if any. Customer agrees to pay such taxes (excluding taxes based on Skycision\'s net income) unless Customer has provided Skycision with a valid exemption certificate.' + '</p>' + '<p><strong>CONFIDENTIALITY.</strong></p>' + '<p>' + 'Protection of Confidential Information. Each party agrees not to transfer or otherwise disclose the Confidential Information of the other party to any third party except as allowed by this Agreement. Each party shall (i) give access to such Confidential Information solely to those employees and consultants with a need to have access thereto for purposes of this Agreement, and (ii) take the same security precautions to protect against disclosure or unauthorized use of such Confidential Information that the party takes with its own confidential information, but, in no event, shall a party apply less than a reasonable standard of care to prevent such disclosure or unauthorized use. Nothing in this Agreement shall prevent either party from disclosing the Confidential Information of the other party pursuant to any judicial or governmental order or as required by law, provided that the party (to the extent allowed by law) gives the other party reasonable prior notice of such disclosure to contest such order. "<u>Confidential Information</u>" shall mean confidential or other proprietary information that is disclosed by one party to the other party under this Agreement, including, without limitation, designs, software designs and code, product specifications and documentation, business and product plans, and other confidential business information. Confidential Information shall not include information which: (i) is or becomes public knowledge without any action by, or involvement of, the party receiving the Confidential Information hereunder; (ii) is independently developed by the receiving party without use of the other party\'s Confidential Information; (iii) is already known to the receiving party at the time of disclosure under this Agreement; or (iv) is disclosed to the receiving party by a third party who is entitled to disclose it without restriction.' + '</p>' + '<p>' + '<strong>Disclosure of the Existence of this Agreement.</strong> The parties each have the right to disclose the existence of this Agreement, but not the terms and conditions of this Agreement, unless such disclosure is approved in writing by both parties prior to such disclosure, or is included in a filing required to be made with a governmental authority' + '</p>' + '<p>' + '<strong>Use of Certain Information.</strong> Customer consents to Skycision engaging in data mining/benchmarking activities in connection with Customer\'s use of the Services and Skycision\'s use and commercialization of aggregated and de-identified Customer Data that it discloses to Skycision in connection with this Agreement, subject to the provisions of Section 4.1 of this Agreement and the satisfaction of each of the following conditions: (i) no Customer specific or Customer-identifiable information shall be disclosed, and (ii) the identity of the Customer shall be protected and shall not be disclosed.' + '</p>' + '<p>' + '<strong>INTELLECTUAL PROPERTY.</strong>' + '</p>' + '<p>' + '<strong>Intellectual Property Rights.</strong> Except as expressly set forth herein, Skycision shall retain all right, title and interest in, and shall be the sole owner of, the Services, Documentation, and Skycision\'s Confidential Information, including, without limitation, any Intellectual Property Rights (as defined below) therein. Customer shall not copy, distribute, reproduce or use such materials except as expressly permitted under this Agreement. "<u>Intellectual' + 'Property Rights</u>" shall mean all forms of intellectual property rights and protections, including without limitation, all right, title and interest arising under United States common and statutory law and the laws of other countries to all: (i) patents and all filed, pending or potential applications for patents, including any reissue, reexamination, division, continuation or continuation-in-part applications throughout the world now or hereafter filed; (ii) trade secret rights and equivalent rights; (iii) copyrights, other literary property or authors rights, whether or not protected by copyright or as a mask work; and (iv) proprietary indicia, trademarks, trade names, symbols, logos and/or brand names.' + '</p>' + '<p>' + '<strong>Infringement Claims.</strong> Subject to the remainder of this Section 5.2, in connection with the licenses granted hereunder in Section 1.2, Skycision, at its sole expense, agrees to defend Customer against any third party claim that Customer\'s use of the Services, as delivered by Skycision to Customer and used in accordance with this Agreement and the Documentation, directly infringes a third party copyright or issued patent or directly misappropriated a trade secret (but only to the extent such misappropriation is not a result of Customer\'s actions under the laws of the United States) (an "<u>Infringement' + 'Claim</u>") and indemnify Customer from the resulting costs and damages finally awarded against Customer to such third party by a court of competent jurisdiction or agreed to in settlement; provided that (i) Customer promptly notifies Skycision in writing of the Infringement Claim; (ii) Skycision has sole control of the defense and all related settlement negotiations; and (iii) Customer provides Skycision with the information, assistance and authority to enable Skycision to perform Skycision\'s obligations under this Section 5.2. Customer may not settle or compromise any Infringement Claim without the prior written consent of Skycision. In any action based on an Infringement Claim, Skycision, at its option and its own expense, will either: (1) procure the right for Customer to continue using the Services in accordance with this Agreement; (2) make such alterations, modifications or adjustments to the Services so that the alleged infringing Services become non-infringing without incurring a material diminution in performance or function; (3) replace the Services with a non-infringing substantially similar substitute; or (4) terminate the Services license, and upon Customer certified destruction or deletion of the Services, Skycision shall refund to Customer the unused remainder of any Fees prepaid by Customer and received by Skycision. Skycision shall have no liability or obligations for an Infringement Claim pursuant to this Section 5.2 to the extent that it results from: (a) modifications to the Services made by a party other than Skycision or under the direct control of Skycision; (b) the combination, operation or use of the Services with non-Skycision products; (c) use of the Services outside of the scope of this Agreement or in contravention of the Documentation; (d) Skycision\'s use of any designs, plans, instructions, specifications, diagrams or the like, provided by Customer, if any; (e) Customer\'s failure to use all upgrades and updates to the Services provided by Skycision, if the claim would not have occurred but for such failure; (f) use of open source technology or freeware technology or any derivatives or other adaptions thereof not embedded by Skycision into the Services; or (g) any Services that are provided on a no charge, beta or evaluation basis. Nothing in this provision shall be construed as a limitation on Customer\'s ability to retain legal counsel at its own expense to passively monitor the proceedings. This Section 5.2 sets forth Customer\'s sole and exclusive remedies and Skycision\'s entire liability with respect to Infringement Claims.' + '</p>' + '<p>' + '<strong>TERM AND TERMINATION.</strong>' + '</p>' + '<p>' + '<strong>Term. </strong>' + '</p>' + '<p>' + '<strong>Quarterly Term.</strong> If Customer has elected the quarterly version of the Services, the Agreement shall commence as of the Effective Date and continue for the period of thirty (90) days thereafter (the "Quarterly Initial Term"). Thereafter, this Agreement shall automatically renew for successive periods of thirty (90) days each (each a "Renewal Term"), unless either party gives the other party written notice of its intention to terminate not less than twenty (20) days prior to expiration of the Monthly Initial Term or then current Renewal Term, as applicable.' + '</p>' + '<p>' + '<strong>Annual Term.</strong> If Customer has elected the annual version of the Services, the Agreement shall commence as of the Effective Date, or the date upon which Customer upgrades to an annual term from a monthly term, and continue for the period of one (1) year thereafter (the "<u>Initial Term</u>"). Thereafter, this Agreement shall automatically renew for successive Renewal Terms, unless either party gives the other party written notice of its intention to terminate not less than twenty (20) days prior to expiration of the Initial Term or then current Renewal Term, as applicable.' + '</p>' + '<p>' + '<strong>Term.</strong> The “<u>Term</u>” of this Agreement shall be collectively (as applicable), the Quarterly Initial Term, the Initial Term and each Renewal Term (if any).' + '</p>' + '<p>' + '<strong>Termination for Cause.</strong> In the event of any material breach of this Agreement, the nonbreaching party may terminate this Agreement by providing thirty (30) days prior written notice to the breaching party; provided, however, that this Agreement shall not terminate if the breaching party has cured the breach prior to the expiration of such thirty (30) day period.' + '</p>' + '<p>' + '<strong>Termination for Insolvency.</strong> Either party may terminate this Agreement, without notice, (i) upon the institution by or against the other party of insolvency, receivership or bankruptcy proceedings, (ii) upon the other party\'s making an assignment for the benefit of creditors, or (iii) upon the other party\'s dissolution or ceasing to do business.' + '</p>' + '<p>' + '<strong>Termination for Convenience.</strong> Skycision may terminate this Agreement upon ninety (90) days prior written notice to the Customer.' + '</p>' + '<p>' + '<strong>Effect of Termination.</strong> Upon the expiration or termination of this Agreement, all license rights of Customer under this Agreement shall automatically and immediately cease. Section 6.5 and Articles 3 (for the Fees incurred prior to termination of the Agreement), 4, 5, 7, 8 and 9 shall survive expiration or termination of this Agreement for any reason.' + '</p>' + '<p>' + '<strong>LIMITED WARRANTY.</strong> Skycision warrants that, for a period of ninety (90) days after delivery, availability, or execution of the Agreement, the Services will function in accordance with the Documentation in all material respects. As Customer\'s sole and exclusive remedy and Skycision\'s entire liability for any breach of the foregoing warranty, Skycision will repair, replace, or refund the Services, at no additional charge to Customer. The limited warranty set forth herein shall automatically become null and void if a party other than Skycision modifies the Services in any way' + '</p>' + '<p>EXCEPT AS EXPRESSLY SET FORTH IN THIS SECTION, SKYCISION HEREBY (A) PROVIDES THE SERVICES, THE DOCUMENTATION AND SKYCISION CONFIDENTIAL INFORMATION "AS-IS" "AS AVAILABLE", AND "WITH ALL FAULTS" WITHOUT ANY WARRANTIES OF ANY KIND, AND (B) DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING, WITHOUT LIMITATION , ALL IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT TO THE MAXIMUM EXTENT PERMITTED BY LAW. NOTHING HEREIN SHALL BE CONSTRUED AS A WARRANTY OF COMPATIBILITY WITH ANY PARTICULAR MOBILE/ COMPUTING DEVICE, OPERATING SYSTEM, OR OTHER SOFTWARE RESIDENT ON CUSTOMER\'S DEVICE.</p>' + '<p>CUSTOMER ACKNOWLEDGES THAT ITS USE OF THE SERVICES IS AT ITS SOLE RISK. SKYCISION DOES NOT REPRESENT OR WARRANT THAT THE SERVICES WILL BE ERROR-FREE OR UNINTERRUPTED; THAT DEFECTS WILL BE CORRECTED; OR THAT THE SERVICES OR THE SERVER(S) THAT MAKES THE SERVICES AVAILABLE ARE FREE FROM ANY HARMFUL COMPONENTS, INCLUDING, WITHOUT LIMITATION, VIRUSES. SKYCISION DOESNOT MAKE ANY REPRESENTATIONS OR WARRANTIES THAT THE INFORMATION (INCLUDING ANY INSTRUCTIONS AND/OR ANALYSIS) PROVIDED IN THE DOCUMENTATION AND/OR IN CONNECTION WITH THE SERVICES IS TRUE, VALID, ACCURATE, COMPLETE, OR USEFUL. SKYCISION DOES NOT WARRANT THAT CUSTOMER\'S USE OF THE SERVICES IS LAWFUL IN ANY PARTICULAR JURISDICTION, AND SKYCISION SPECIFICALLY DISCLAIMS SUCH WARRANTIES.' + '</p>' + '<P>' + '<STRONG>LIMITATION OF LIABILITY.</STRONG> IN NO EVENT SHALL SKYCISION BE LIABLE FOR ANY INDIRECT, PUNITIVE ,INCIDENTAL,SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING OUT OF OR IN ANY WAY CONNECTED WITH THE USE OF THE SERVICES, DOCUMENTATION, OR CUSTOMER DATA, THE DELAY OR INABILITY TO USE THE SERVICES OR OTHERWISE ARISING FROM THIS AGREEMENT, INCLUDING WITHOUT LIMITATION, LOSS OF REVENUE OR ANTICIPATED PROFITS OR LOST BUSINESS OR LOST SALES, WHETHER BASED IN CONTRACT, TORT (INCLUDING NEGLIGENCE), STRICT LIABILITY, OR OTHERWISE, EVEN IF SKYCISION HAS BEEN ADVISED OF THE POSSIBILITY OF DAMAGES. THE TOTAL LIABILITY OF SKYCISION, WHETHER BASED IN CONTRACT, TORT (INCLUDING NEGLIGENCE OR STRICT LIABILITY), OR OTHERWISE, SHALL NOT EXCEED, IN THE AGGREGATE, THE FEES PAID TO SKYCISION HEREUNDER IN THE TWELVE MONTH PERIOD ENDING ON THE DATE THAT A CLAIM OR DEMAND IS FIRST ASSERTED. THE FOREGOING LIMITATIONS SHALL APPLY NOTWITHSTANDING ANY FAILURE OF ESSENTIAL PURPOSE OF ANY LIMITED REMEDY.' + '</P>' + '<P>' + '<strong>GENERAL PROVISIONS.</strong>' + '</P>' + '<p>' + '<strong>Relationship of the Parties.</strong> The relationship established between the parties by this Agreement is that of independent contractors, and nothing contained herein shall be construed to: (i) give either party the power to direct and/or control the day-to-day activities of the other, (ii) constitute the parties as partners, joint venturers, co-owners or otherwise as participants in a joint or common undertaking, or (iii) allow a party to create or assume any obligation on behalf of the other party for any purpose whatsoever, except as contemplated by this Agreement.' + '</p>' + '<p>' + '<strong>Complete Understanding; Modification.</strong> This Agreement constitutes the complete and exclusive agreement of the parties and supersedes all prior understandings and agreements, whether written or oral, with respect to the subject matter hereof. No modification of or amendment to this Agreement, nor any waiver of any rights under this Agreement shall be effective unless in a writing signed by both parties hereto.' + '</p>' + '<p></p>' + '<p>' + '<strong>Severability.</strong> If any provision of this Agreement is held to be invalid or unenforceable under the circumstances, such provision\'s application in any other circumstances and the remaining provisions of this Agreement shall not be affected thereby.' + '</p>' + '<p>' + '<strong>Nonassignability and Binding Effect.</strong> Customer shall not assign this Agreement to any third party without the prior written consent of Skycision. For purposes of this Agreement, an assignment shall include the merger or consolidation of Customer with or into another entity or the acquisition of fifty percent (50%) or more of the outstanding voting equity of Customer by a third party after the Effective Date. Skycision reserves the right to assign any portion of this Agreement with written notice to Customer. Subject to the foregoing, this Agreement shall be binding upon and inure to the benefit of the parties hereto and their permitted successors and assigns.' + '</p>' + '<p>' + '<strong>Export Laws.</strong> The Services are subject to United States export control laws and regulations and may be subject to export or import regulations in other countries. These and regulations include licensing requirements and restrictions on destinations, end users, and end use. Customer shall comply with all United States and international export and import laws and regulations that apply to the Services and acknowledges that Customer has the responsibility to obtain any and all necessary licenses to export, re-export, or import the Services and covenants that it shall not, directly or indirectly, sell, export, reexport, transfer, divert, or otherwise dispose of any Services, source code, or technology received from Skycision under this Agreement to any other party or destination prohibited by the laws or regulations of the United States, without prior written consent from Skycision and governmental authorization as required by those laws and regulations.' + '</p>' + '<p>' + '<strong>Force Majeure.</strong> Skycision shall not be liable for any loss resulting from a cause over which it does not have direct control, including, but not limited to, failure of electronic or mechanical equipment or communication lines, telephone or other interconnect problems, computer viruses, unauthorized access, theft, operator errors, severe weather, earthquakes, or natural disasters, strikes or other labor problems, wars, or governmental restrictions.' + '</p>' + '<p>' + '<strong>Waiver.</strong> No failure or delay on the part of any party in exercising any right hereunder, irrespective of the length of time for which such failure or delay shall continue, will operate as a waiver of, or impair, any such right. No single or partial exercise of any right hereunder shall preclude any other or further exercise thereof or the exercise of any other right. No waiver of any right hereunder will be effective unless given in a signed writing.' + '</p>' + '<p>' + '<strong>Commercial Software Notice.</strong> If the Services are being licensed by or on behalf of the U.S. Government or by a U.S. Government prime contractor or subcontractor (any tier), then their rights in the Services and Documentation are only as set forth in this Agreement; this is in accordance with 48 CFR 227.7201 through 227.7202-4 (for Department of Defense (DOD) acquisitions) and with 48 CFR 2.101 and 12.212 (for non-DOD acquisitions).' + '</p>' + '<p>' + '<strong>Choice of Law, Forum and Arbitration.</strong> This Agreement shall be governed by and construed in accordance with the laws of the Commonwealth of Pennsylvania, without giving effect to its principles of conflicts of laws. Any dispute arising out of or in connection with this Agreement shall be finally decided by arbitration in Pittsburgh, Pennsylvania according to the Rules of Procedure for arbitration of the American Arbitration Association.' + '</p>' + '<p>Notwithstanding anything to the contrary set forth above, this Section 9.9 shall not apply to disputes relating to: (1) Customer\'s or Skycision\'s intellectual property (such as trademarks, trade dress, domain names, trade secrets, copyrights and patents); (2) violations of third party terms and conditions; or (3) any dispute in which Skycision is seeking injunctive or equitable relief to prevent further breaches of this Agreement by Customer.</p>' + '<p>' + '<strong>Entire Agreement.</strong> This Agreement constitutes the entire and exclusive agreement and understanding between the parties relating to the Services and supersedes any and all oral or written representations, understandings or agreements relating thereto.' + '</p>' + '</div>' + '<div class="modal-footer cd-form-bottom-message">' + '<a href="" ng-click="cancel()"><strong>Close</strong></a>' + '</div>' + '</div>');
    }
})();
'use strict';

(function () {

	angular.module('skyApp.signup').directive('termsCond', [terms]);

	function terms() {
		return {
			restrict: 'E',
			templateUrl: 'app/signup/terms.conditions.html'
		};
	}
})();
'use strict';

(function () {

    angular.module('skyApp.tour', []);
})();
/*(function() {
    angular
        .module('skyApp.tour')
        .controller('tourController', tourController);

    tourController.$inject = ['$scope', '$state'];

    function tourController($scope, $state) {

        $scope.startWalkthrough("tour");
    }

})();*/
"use strict";
'use strict';

(function () {
    angular.module('skyApp.tour').config(['$stateProvider', '$urlRouterProvider', configureStates]);

    function configureStates($stateProvider, $urlRouterProvider) {

        $stateProvider.state('home.tour', {
            name: 'home.tour',
            url: '/tour',
            data: {
                sliderOpen: false
            }
        });
    }
})();
'use strict';

(function () {

  angular.module('skyApp.upload', ['debounce']);
})();
'use strict';

(function () {

    angular.module('skyApp.upload').factory('SkyUploaderService', []).component('skyUploader', {
        controller: UploadController,
        templateUrl: 'templates/upload/upload-inset.view.html',
        bindings: {
            uploaderId: '@',
            moveTarget: '@',
            move: '&'
        }
    });

    UploadController.$inject = ['$scope', 'UploadService', '$interval', '$timeout', '$element'];
    function UploadController($scope, UploadService, $interval, $timeout, ele) {
        var ctrl = this;

        $scope.$on('$destroy', function () {
            UploadService.move(ctrl.moveTarget);
        });
        $scope.status = {
            isCustomHeaderOpen: false,
            isFirstOpen: true,
            isFirstDisabled: false
        };

        ctrl.move = function () {
            console.log(ctrl.moveTarget, ele);
        };

        ctrl.$postLink = $timeout(function () {

            console.log(ctrl.uploaderId);
            if (!!!ctrl.uploaderId) {
                return;
            }
            UploadService.setup(ele, '#' + ctrl.uploaderId);
            // Dropzone.prototype.uploadFiles = UploadService.upload;

            // $timeout(function(){
            //     console.log('timer');
            //    

            // },10000);
            // previewsContainer: `#${ctrl.uploaderId}`,
        }, 500);
    }
})();
'use strict';

(function () {

    angular.module('skyApp.upload').run(['UploadService', '$state', '$timeout', function (UploadService, $state, $timeout) {
        $timeout(function () {
            UploadService.activate();
        }, 500);
    }]).factory('UploadService', ['$state', 'AWSService', '$interval', '$timeout', '$q', 'debounce', '$templateCache', UploadService]);

    function UploadService($state, AWSService, $interval, $timeout, $q, debounce, $templateCache) {
        var US = this;
        var s3 = AWSService.s3();
        var service = {
            getUploadHandler: getUploadHandler,
            setup: setup,
            move: move,
            activate: activate
        };

        return service;

        function getUploadHandler() {
            return function (files) {
                console.log(files);
                return files.map(function (file) {
                    var p = $q.defer();

                    var managed = new AWS.S3.ManagedUpload({
                        ComputeChecksums: true,
                        params: {
                            Body: file,
                            Bucket: 'skycisiondropbucket',
                            Key: file.name,
                            ContentType: file.type
                        }
                    });
                    managed.on('httpUploadProgress', function (progress) {
                        US.dz.emit("uploadprogress", file, 100 * progress.loaded / progress.total, progress.loaded);
                    });
                    managed.send(function (err, data) {
                        US.dz._finished(files, '', err);
                        debounce(US.dz.processQueue(), 200);
                    });
                });
            };
        }

        function activate() {

            var PREVIEW_TEMPLATE = $templateCache.get('upload.preview.html');
            var REMOVE_FILE = $templateCache.get('upload.removefile.svg');

            Dropzone.autoDiscover = false;
            Dropzone.options.body = false;

            var dropzoneHolder = new Dropzone('#body', {
                url: '/',
                // clickable: false,
                autoProcessQueue: false,
                parallelUploads: 4,
                processing: function processing(file) {
                    if (file.previewElement) {
                        file.previewElement.classList.add("dz-processing");
                        if (file._removeLink) {
                            return file._removeLink.innerHTML = this.options.dictCancelUpload;
                        }
                    }
                },
                dictCancelUpload: "<img src='/static/img/cancel-upload.png' alt='Cancel Upload' title='Cancel Upload' width='25' height='25'>",
                dictRemoveFile: REMOVE_FILE,
                previewTemplate: PREVIEW_TEMPLATE
            });

            dropzoneHolder._uploadFiles = dropzoneHolder.uploadFiles;
            dropzoneHolder.uploadFiles = service.getUploadHandler(dropzoneHolder);
            US.dz = dropzoneHolder;
        }

        function setup(ele, querySelector) {
            US.ele = ele;
            US.dz.previewsContainer = Dropzone.getElement(querySelector);
            US.dz.clickableElements = Dropzone.getElements("input.dz-browse", "clickable");
            var browseBtnElm = ele.find("#browseBtn");
            var deleteAllBtnElm = ele.find("#deleteAllBtn");
            var uploadBtnElm = ele.find("#uploadBtn");
            console.log(uploadBtnElm);

            US.dz.on("addedfile", function () {
                handleActionBtnsDisplay();
            });
            US.dz.on("removedfile", function () {
                handleActionBtnsDisplay();
            });

            uploadBtnElm.on('click', function (e) {
                e.stopPropagation();
                US.dz.processQueue();
            });

            deleteAllBtnElm.on('click', function (e) {
                e.stopPropagation();
                US.dz.removeAllFiles();
            });
            // handleActionBtnsDisplay();
            function handleActionBtnsDisplay() {
                var filesLen = US.dz.files.length;
                browseBtnElm.addClass("showActive");
                if (filesLen === 0) {
                    uploadBtnElm.removeClass("showActive");
                    deleteAllBtnElm.removeClass("showActive");
                } else if (filesLen == 1) {
                    uploadBtnElm.addClass("showActive");
                    browseBtnElm.addClass("showActive");
                    deleteAllBtnElm.removeClass("showActive");
                } else if (filesLen > 1) {
                    uploadBtnElm.addClass("showActive");
                    deleteAllBtnElm.addClass("showActive");
                }
            }
        }

        function move(target) {
            var uploaderTarget = $state.$current.data.uploaderTarget;
            if (US.dz.files.length === 0 || !!!uploaderTarget) {
                return;
            }
            var s = 'uploader-target[target-id="' + uploaderTarget + '"]';
            if (US.ele.find('.dz-preview').length) {
                service.setup(US.ele.appendTo(s), s);
            }
        }
    }
})();
'use strict';

(function () {
    angular.module('skyApp.upload').config(['$stateProvider', '$urlRouterProvider', configureStates]);

    function configureStates($stateProvider, $urlRouterProvider) {

        $stateProvider.state('home.upload', {
            url: '/upload',
            views: {
                // 'main': {
                //     template:'<sky-uploader uploader-id="{{uploadHolderId}}" move-target="nav-uploader"></sky-uploader>',
                //     controller: skyuploadCtrl
                // },
                'content': {
                    template: '<sky-uploader uploader-id="uploadHolderIdasdfasdf" move-target="nav-uploader"></sky-uploader>'
                }
            },
            data: {
                sliderOpen: true,
                contentWidth: 50
            }
        });
    }

    function skyuploadCtrl() {}
    // $scope.uploadHolderId = 'dropzone2' + Math.ceil(Math.random()*10);


    // skyuploadCtrl.$inject = ['$scope'];
})();
'use strict';

(function () {

    angular.module('skyApp.users', ['skyApp.utils', 'ui.router', 'ngCookies']);
})();
'use strict';

(function () {

    angular.module('skyApp.users').factory('AuthService', ['$q', '$state', '$cookies', '$rootScope', 'AWSService', 'UserService', AuthService]);

    function AuthService($q, $state, $cookies, $rootScope, AWSService, UserService) {
        var SERVICE = {};

        SERVICE.startAuthenticating = startAuthenticating;
        SERVICE.isAuthenticated = isAuthenticated;
        SERVICE.authenticateUser = authenticateUser;
        SERVICE.registerUser = registerUser;
        SERVICE.confirmRegistration = confirmRegistration;
        SERVICE.resetPassword = resetPassword;
        SERVICE.signOut = signOut;

        return SERVICE;

        function startAuthenticating() {
            angular.extend($rootScope, {
                user: null
            });
            // collect entropy for SRP Protocol RNG               
            sjcl.random.startCollectors();

            $rootScope.$on('$stateChangeStart', function (event, next, params) {
                console.log(next);
                var desiredPage = next.name;

                // redirect to login page if not logged in and trying to access a restricted page
                var restrictedPage = ['login', 'signup'].indexOf(desiredPage) === -1;

                SERVICE.isAuthenticated().then(function (yes) {

                    if (next.redirectTo) {
                        event.preventDefault();
                        $state.go(next.redirectTo, params, {
                            location: 'replace'
                        });
                    }

                    if (restrictedPage) {
                        angular.noop();
                    } else {
                        event.preventDefault();
                        $state.go(desiredPage === 'login' ? 'home' : desiredPage, params, {
                            location: 'replace'
                        });
                    }
                }).catch(function (no) {
                    // UserService.setUser(null);
                    if ('login' !== desiredPage) {
                        event.preventDefault();
                        $state.go('login', params, {
                            notify: false
                        });
                    }
                });
            });
        }

        function isAuthenticated() {
            var u = $rootScope.user;
            if (!!u) {
                return $q.when(true);
            } else {
                return AWSService.getUserPool().then(function (userPool) {
                    return userPool.obj.getCurrentUser();
                }).then(function (u) {
                    return UserService.setUser(u);
                }).then(function (success) {
                    $rootScope.user = success;
                    return true;
                });
                // .catch( () => false );
            }
        }

        function signOut() {
            $rootScope.user = null;

            // AWSService.signOut();
            // service._user = null;
            $state.go('login');
        }

        function registerUser(username, password, otherParams) {
            return $q(function (resolve, reject) {
                AWSService.getUserPool().then(function (userPool) {
                    return userPool.registerUser(username, password, otherParams);
                }).then(function (success) {
                    resolve(success.user);
                }).catch(function (failure) {
                    console.log(failure);
                    reject(failure);
                });
            });
        }

        function confirmRegistration(user, code) {
            var theUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser({
                Username: user.username,
                Pool: user.pool
            });

            return $q(function (resolve, reject) {
                theUser.confirmRegistration(code, true, function (err, result) {
                    if (err) {
                        reject(err);
                    }
                    resolve(result);
                });
            });
        }

        function authenticateUser(username, password) {
            return $q(function (resolve, reject) {
                AWSService.getUserPool().then(function (userPool) {
                    return userPool.authenticateUser(username, password);
                }).then(function (user) {
                    UserService.setUser(user);
                    $rootScope.user = user;
                    resolve(true);
                    $state.go('home', {});
                }).catch(function (err) {
                    return reject(err);
                });
            });
        }

        function resetPassword(email) {

            return AWSService.getUserPool().then(function (pool) {
                console.log(pool);
                var theUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser({
                    Username: email,
                    Pool: pool.obj
                });

                return $q(function (resolve, reject) {
                    theUser.client.forgotPassword({
                        ClientId: pool.obj.getClientId(),
                        Username: email
                    }, function (err, data) {
                        if (err) {
                            console.log(err);
                            reject(null);
                        } else {
                            console.log(data);
                            resolve(theUser);
                        }
                    });
                });
            });
        }
    }
})();
'use strict';

(function (n, z, A) {
    n.module("skyApp.users").constant("AWS", z).constant("AWSCognito", A).provider("AWSService", ["AWS", "AWSCognito", function (e, h) {
        var b = this;
        e.config.region = "us-east-1";
        b.c = null;
        b.a = null;
        b.b = {};
        b.setArn = function (d) {
            d && (b.c = d);
        };
        b.setIdentityPool = function (d) {
            d && (b.a = d);
        };
        b.setRegion = function (d) {
            d && (b.region = d, e.config.region = d, h.config.region = d);
        };
        b.setLogger = function (d) {
            d && (e.config.logger = d);
        };
        b.setAMAOptions = function (d) {
            d && (b.i = d);
        };
        b.setUserPoolOptions = function (d) {
            d && (b.b.f = d.UserPoolId, b.b.g = d.ClientId);
        };
        b.$get = ["$q", "$cacheFactory", "$log", function (d, g) {
            function p(a) {
                var f = {
                    get: "get",
                    put: "put",
                    update: "update",
                    bget: "batchGet",
                    bwrite: "batchWrite",
                    query: "query"
                },
                    c = d.defer();
                k.then(function () {
                    var l = q.get(JSON.stringify(a));
                    l || (l = new e.DynamoDB.DocumentClient(a), q.put(JSON.stringify(a), l));
                    var b = {};
                    b.ops = b.db = l;
                    b["do"] = function (a, c) {
                        var b;
                        (b = f[a]) || d.reject("Operation not supported: " + a);
                        return b ? this.db[b](c).promise() : null;
                    };
                    c.resolve(b);
                });
                return c.promise;
            }
            var r = g("s3Cache"),
                t = g("cog"),
                u = g("sns"),
                v = g("sqs"),
                w = g("syn");
            g("api");
            var x = g("ama"),
                y = g("lmb"),
                q = g("dynamo");
            g("userPool");
            var m = d.defer(),
                k = m.promise;
            g = {
                signOut: function signOut() {
                    var a = d.defer();
                    void 0 !== e.config.credentials && null !== e.config.credentials ? e.config.credentials.clearCachedId() : a.resolve();
                    return a.promise;
                },
                credentials: function credentials() {
                    return k;
                },
                setToken: function setToken(a, f) {
                    var c = d.defer();
                    a = {
                        IdentityPoolId: b.a,
                        RoleArn: b.c,
                        Logins: {
                            "accounts.google.com": a
                        }
                    };
                    f && (a.m = f);
                    b.config = a;
                    e.config.credentials = new e.CognitoIdentityCredentials(a);
                    e.config.credentials.get(function () {
                        m.resolve(e.config.credentials);
                        c.resolve(!0);
                    });
                    return c.promise;
                },
                setCognitoToken: function setCognitoToken(a) {
                    var f = d.defer(),
                        c = {};
                    c["cognito-idp.us-east-1.amazonaws.com/" + b.b.f] = a;
                    a = {};
                    a.IdentityPoolId = e.config.credentials.params.IdentityPoolId;
                    a.IdentityId = e.config.credentials.params.identityId;
                    a.RoleArn = b.c;
                    a.Logins = c;
                    b.config = a;
                    h.config.credentials = new e.CognitoIdentityCredentials(a);
                    h.config.credentials.clearCachedId();
                    h.config.credentials.get(function (a) {
                        a ? (console.log(a), f.reject(a)) : (m.resolve(e.config.credentials), e.config.credentials = h.config.credentials, f.resolve(!0));
                    });
                    return f.promise;
                },
                lambda: function lambda(a) {
                    var b = d.defer();
                    k.then(function () {
                        var c = y.get(JSON.stringify(a));
                        c || (c = new e.Lambda(a), y.put(JSON.stringify(a), c));
                        b.resolve(c);
                    });
                    return b.promise;
                },
                ama: function ama(a) {
                    var f = d.defer();
                    k.then(function () {
                        var c = x.get(JSON.stringify(a));
                        c || (c = new AMA.Manager(b.i), x.put(JSON.stringify(a), c));
                        f.resolve(c);
                    });
                    return f.promise;
                },
                s3: function s3(a) {
                    var b = d.defer();
                    k.then(function () {
                        var c = r.get(JSON.stringify(a));
                        c || (c = new e.S3(a), r.put(JSON.stringify(a), c));
                        b.resolve({
                            v: c,
                            putObject: function putObject(a) {
                                return c.putObject(a).promise();
                            },
                            getObject: function getObject(a) {
                                return c.getObject(a).promise();
                            },
                            getSignedUrl: function getSignedUrl(a, b) {
                                return c.getSignedUrl(a, b);
                            }
                        });
                    });
                    return b.promise;
                }
            };
            g.dynamo = p;
            p["do"] = function () {};
            g.syn = function (a) {
                var f = d.defer();
                k.then(function (c) {
                    var d = w.get(JSON.stringify(a));
                    d || (d = new e.CognitoSync({
                        IdentityId: c.identityId,
                        IdentityPoolId: b.a
                    }), d.config.logger = console, w.put(JSON.stringify(a), d));
                    f.resolve(d.u);
                });
                return f.promise;
            };
            g.cog = function (a) {
                return this.w().then(function () {
                    var b = d.defer();
                    k.then(function () {
                        var c = t.get(JSON.stringify(a));
                        c || (c = new e.CognitoSyncManager(a), t.put(JSON.stringify(a), c));
                        b.resolve({
                            o: c,
                            j: function j(a) {
                                var b = d.defer();
                                c.j(a, function (a, c) {
                                    a ? b.reject(a) : console.log(c);
                                    b.resolve(c);
                                });
                                return b.promise;
                            },
                            l: function l() {
                                return d.when(c.l());
                            }
                        });
                    });
                    return b.promise;
                });
            };
            g.getUserPool = function () {
                var a;
                if (!a) {
                    e.config.region = b.region;
                    e.config.credentials = new e.CognitoIdentityCredentials({
                        IdentityPoolId: b.a
                    });
                    h.config.credentials || (h.config.region = b.region, h.config.credentials = new e.CognitoIdentityCredentials({
                        IdentityPoolId: b.a
                    }));
                    var f = {};
                    f.UserPoolId = b.b.f;
                    f.ClientId = b.b.g;
                    a = new h.CognitoIdentityServiceProvider.CognitoUserPool(f);
                    h.config.update({
                        accessKeyId: "doesnt",
                        secretAccessKey: "matter"
                    });
                }
                f = {};
                f.obj = a;
                f.registerUser = function (c, b, f) {
                    var e = d.defer(),
                        g = [];
                    n.forEach(f, function (a, b) {
                        var c = {};
                        c.Name = b;
                        c.Value = a;
                        g.push(new h.CognitoIdentityServiceProvider.CognitoUserAttribute(c));
                    });
                    a.signUp(c, b, g, null, function (a, c) {
                        a ? (e.reject(a), console.log(a)) : (console.log(c), e.resolve(c));
                    });
                    return e.promise;
                };
                f.authenticateUser = function (a, b) {
                    var f = {};
                    f.Username = a;
                    f.Password = b;
                    var e = new h.CognitoIdentityServiceProvider.AuthenticationDetails(f),
                        g = new h.CognitoIdentityServiceProvider.CognitoUser({
                        Username: a,
                        Pool: this.obj
                    });
                    return d(function (a, b) {
                        g.authenticateUser(e, {
                            onSuccess: function onSuccess() {
                                a(g);
                            },
                            onFailure: function onFailure(a) {
                                return b(a);
                            }
                        });
                    });
                };
                f.resetPassword = function () {
                    return d.defer().reject("TODO: Implement password reset handler");
                };
                return d.when(f);
            };
            g.sns = function (a) {
                var b = d.defer();
                k.then(function () {
                    var c = u.get(JSON.stringify(a));
                    c || (c = new e.SNS(a), u.put(JSON.stringify(a), c));
                    b.resolve(c);
                });
                return b.promise;
            };
            g.sqs = function (a) {
                var b = d.defer();
                k.then(function () {
                    var c = v.get(JSON.stringify(a)),
                        g = d.defer();
                    c ? g.resolve(c) : new e.SQS().s(a, function (b, d) {
                        d ? (c = d.h, v.put(JSON.stringify(a), c), g.resolve(c)) : g.reject(b);
                    });
                    g.promise.then(function (a) {
                        a = new e.SQS({
                            params: {
                                h: a
                            }
                        });
                        b.resolve(a);
                    });
                });
                return b.promise;
            };
            return g;
        }];
    }]);
})(window.angular, window.AWS, window.AWSCognito);
//# sourceMappingURL=awsservice.min.js.map
'use strict';

(function () {
    angular.module('skyApp.users').controller('CreateFarmController', ['$scope', '$uibModalInstance', 'UserService', CreateFarmController]);

    function CreateFarmController($scope, $uibModalInstance, UserService) {
        $scope.create = function (farm) {
            console.log(farm);
            UserService.createFarm(farm);
            $uibModalInstance.close();
        };
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
})();
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

(function () {
    angular.module('skyApp.users').factory('UserService', ['$q', '$http', '$state', '$cacheFactory', 'AWSService', UserService]);

    function UserService($q, $http, $state, $cacheFactory, AWSService) {

        var userDefer = $q.defer();
        var userPromise = userDefer.promise;

        var orgsDefer = $q.defer();
        var orgsPromise = orgsDefer.promise;

        var orgsCache = $cacheFactory('orgs');

        var service = {
            _user: null,
            UsersTable: 'users-skycision',
            OpsTable: 'ops-skycision',
            OrgsTable: 'orgs-skycision',
            BlocksTable: 'BlocksTable',
            BLOCKS_TABLE: 'blocks-skycision',
            INDEX_TABLE: 'id-singleton',
            Bucket: "skycisionfarmbucket",
            DatasetName: "profile",
            ProfileEntries: ["firstName", "lastName", "email", "homeCoord", "farmId", "clients"],
            signOut: signOut,
            setUser: setUser,
            getUser: getUser,
            getOrg: getOrg,
            getRoute: getRoute,
            generateFields: generateFields,
            commitData: commitData,
            commitWithKey: commitWithKey,
            createOperation: createOperation,
            configRequestParams: configRequestParams,
            updateOrgId: updateOrgId
        };

        return service;

        function signOut() {
            service._user.signOut();
            service._user = null;
        }

        function setUser(user) {
            return $q(function (resolve, reject) {
                if (!!user) {
                    user.getSession(function (err, session) {
                        if (session.isValid()) {
                            AWSService.setCognitoToken(session.getIdToken().getJwtToken());
                            AWSService.ama();
                            console.log("Successfully Authenticated.");
                            service._user = user;
                            user.getUserAttributes(function (err, attributes) {
                                if (err) {
                                    console.log(err);
                                    reject(err);
                                }
                                // parse  [{Name: $name , Value: $value}]
                                // into   {$names:$values}
                                var parsedAttrs = unpackObject(attributes);
                                parsedAttrs.identityId = AWS.config.credentials.params.IdentityId;
                                userDefer.resolve(parsedAttrs);
                            });
                            resolve(user);
                        } else {
                            reject('Not authenticated');
                            userDefer.reject('Not authenticated.');
                        }
                    });
                } else {
                    reject('No user.');
                }
            });
        }

        function getUser() {
            return userPromise;
        }

        function updateOrgId(neworgid) {
            service.getUser().then(function (user) {
                AWSService.dynamo().then(function (dynamo) {
                    // Find the User by email
                    dynamo.do('get', {
                        TableName: service.UsersTable,
                        Key: {
                            'user-email': user.email
                        }
                    }).then(function (data) {
                        return $q(function (resolve, reject) {

                            dynamo.do('put', {
                                TableName: service.UsersTable,
                                Item: {
                                    'user-email': user.email,
                                    'address': user.address,
                                    'user-id': user.identityId,
                                    'orgs': [neworgid]
                                }
                            }).then(function (data) {
                                //resolve(data.Item);
                                console.log("data.Item: ", data.Item);
                            }, function (err) {
                                //logMessage('dynamoDB error')(new Error(err));
                                //reject(err);
                                console.log("-reject-");
                            });
                        });
                    });
                });
            });
        }

        function getOrg() {
            service.getUser().then(function (user) {

                var org = orgsCache.get(JSON.stringify(user));
                if (!!org) {
                    return orgsDefer.resolve(org);
                }

                AWSService.dynamo().then(function (dynamo) {
                    // Find the User by email
                    dynamo.do('get', {
                        TableName: service.UsersTable,
                        Key: {
                            'user-email': user.email
                        }
                    }).then(function (data) {
                        return $q(function (resolve, reject) {
                            if (Object.keys(data).length === 0) {
                                // User didn't previously exist
                                // so create an entry
                                dynamo.do('put', {
                                    TableName: service.UsersTable,
                                    Item: {
                                        'user-email': user.email,
                                        'address': user.address,
                                        'user-id': user.identityId
                                    }
                                }).then(function (data) {
                                    resolve(data.Item);
                                }, function (err) {
                                    logMessage('dynamoDB error')(new Error(err));
                                    reject(err);
                                });
                            } else {
                                resolve(data.Item);
                            }
                        });
                    }).then(function (userInfo) {
                        // Find the User's Orgs
                        var orgs = userInfo.orgs.values;
                        var requestItems = {};
                        requestItems[service.OrgsTable] = {
                            Keys: orgs.map(function (org) {
                                return {
                                    'org-id': org
                                };
                            })
                        };

                        dynamo.do('bget', {
                            RequestItems: requestItems,
                            ReturnConsumedCapacity: 'TOTAL'
                        }).then(function (orgsData) {

                            var out = orgsData.Responses[service.OrgsTable].map(function (org) {
                                var a = {};
                                angular.forEach(org, function (val, key) {
                                    //console.log(typeof val);
                                    a[camelCase(key)] = !!val.values && typeof val.values === "function" ? Array.from(val.values()) : val;
                                });
                                return a;
                            });
                            orgsCache.put(JSON.stringify(user), out[0]);
                            orgsDefer.resolve(out[0]);
                        }).catch(function (err) {
                            return orgsDefer.reject(err);
                        });
                    });
                });
            });
            return orgsPromise;
        }

        function getRoute(farm) {
            function shuffleArray(array) {
                for (var i = array.length - 1; i > 0; i--) {
                    var j = Math.floor(Math.random() * (i + 1));
                    var temp = array[i];
                    array[i] = array[j];
                    array[j] = temp;
                }
                return array;
            }

            var coords = farm.fields[0].baseMesh;
            var converted = converted.map(function (f) {
                return {
                    x: c.lng,
                    y: c.lat
                };
            });

            var shuffled = shuffleArray(converted);
            AWSService.lambda().then(function (lambda) {
                var d = $q.defer();
                lambda.invoke({
                    Payload: {
                        farmId: farm.farmId
                    },
                    FunctionName: 'arn:aws:lambda:us-east-1:717391330650:function:ec2post:BETA',
                    InvocationType: 'RequestResponse'
                }, function (err, response) {
                    if (err) d.reject(err);else d.resolve(response);
                });
                return d.promise;
            }).then(function (response) {
                console.log(response);
            }, function (fail) {
                console.log(fail);
            });
        }

        function generateFields(farm) {
            var d = $q.defer();
            //////
            //////
            console.log(farm);
            // AWSService.lambda().then(function(lambda){
            //  lambda.invoke({
            //      Payload:JSON.stringify(farm),
            //      FunctionName:
            //             'arn:aws:lambda:us-east-1:717391330650:function:ec2post:' + LAMBDA_POST_VER,
            //      InvocationType:'RequestResponse'
            //  },function(err,response) {
            //      if(err) {
            //          d.reject(err);
            //      } else {
            //          console.log(angular.toJson(angular.fromJson(response)));
            //          d.resolve(angular.fromJson(response.Payload));
            //      }
            //  });
            // });
            console.log(farm);
            $http.post('/addField', angular.toJson(farm), 'POST').then(function (success) {
                // console.log(angular.toJson(angular.fromJson(success)));
                var data = angular.fromJson(success).data;

                d.resolve(data);
            });
            return d.promise;
        }

        function commitData(farm) {
            service.commitWithKey(farm, farm.farmId + '/farm.json');
        }

        function commitWithKey(farm, key) {
            console.log(farm);
            AWSService.s3().then(function (s3) {
                s3.putObject({
                    Key: key,
                    Bucket: service.Bucket,
                    Body: angular.toJson(farm),
                    ACL: 'bucket-owner-full-control',
                    CacheControl: 'no-store'
                }).then(console.log, console.log);
            });
        }

        function createOperation() {}

        function configRequestParams(params, table, isArray) {
            return isArray ? configBatchWriteParams.apply(undefined, arguments) : configPutParams.apply(undefined, arguments);
        }

        function configBatchWriteParams(item, tableName) {
            var params = {};
            params[tableName] = {
                PutRequest: {
                    Item: item
                }
            };
            return params;
        }

        function configPutParams(item, tableName) {
            var params = {};
            params = {
                TableName: tableName,
                Item: item
            };
            return params;
        }

        // Convenience function for rejecting top level promise in .catch() method of a long promise chains
        function defaultReject(terminalPromise, rejectVal) {
            return function () {
                terminalPromise.reject(rejectVal);
            };
        }

        function unpackObject(obj) {
            return obj.reduce(function (previousValue, currentValue, currentIndex, array) {
                previousValue[camelCase(currentValue.Name)] = currentValue.Value;
                return previousValue;
            }, {}) || {};
        }

        // Recursively traverse arbitrary JSON to do cleanup
        //   - Replaces falsey values with dashes
        //   - Trims Number types to 6 or fewer decimal places
        function traverse(o) {
            switch (typeof o === 'undefined' ? 'undefined' : _typeof(o)) {
                case 'number':
                    return Number(o.toFixed(6));
                    break;
                case 'object':
                    if (!o) {
                        return '-';
                    }
                    for (var i in o) {
                        o[i] = traverse(o[i]);
                    }
                    break;
            }
            return o;
        }

        function camelCase(name) {
            var SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
            var MOZ_HACK_REGEXP = /^moz([A-Z])/;
            return name.replace(SPECIAL_CHARS_REGEXP, function (_, separator, letter, offset) {
                return offset ? letter.toUpperCase() : letter;
            }).replace(MOZ_HACK_REGEXP, 'Moz$1');
        }
    }
})();
'use strict';

(function () {
    var utilsModule = angular.module('skyApp.utils', []);

    utilsModule.directive('sideNavSlide', sideNavSlideDirective);

    function sideNavSlideDirective() {
        var controller = function controller($scope) {
            $scope.toggleSlideNavBar = function () {
                $scope.openNav = !$scope.openNav;
            };
        };

        return {
            restrict: "E",
            controller: ['$scope', controller],
            link: function link($scope, element, attrs) {
                $scope.openNav = attrs.defaultNavStatus || true;
            },
            transclude: true,
            templateUrl: "templates/sideNavSlide.html"
        };
    }
})();
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

/*
 * angucomplete-alt
 * Autocomplete directive for AngularJS
 * This is a fork of Daryl Rowland's angucomplete with some extra features.
 * By Hidenari Nozaki
 */

/*! Copyright (c) 2014 Hidenari Nozaki and contributors | Licensed under the MIT license */

(function (root, factory) {
  /* jshint ignore: start */
  'use strict';

  if (typeof module !== 'undefined' && module.exports) {
    // CommonJS
    module.exports = factory(require('angular'));
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define(['angular'], factory);
  } else {
    // Global Variables
    factory(root.angular);
  }
  /* jshint ignore: end */
})(window, function (angular) {
  'use strict';

  angular.module('angucomplete-alt', []).directive('angucompleteAlt', ['$q', '$parse', '$http', '$sce', '$timeout', '$templateCache', '$interpolate', function ($q, $parse, $http, $sce, $timeout, $templateCache, $interpolate) {
    // keyboard events
    var KEY_DW = 40;
    var KEY_RT = 39;
    var KEY_UP = 38;
    var KEY_LF = 37;
    var KEY_ES = 27;
    var KEY_EN = 13;
    var KEY_TAB = 9;

    var MIN_LENGTH = 3;
    var MAX_LENGTH = 524288; // the default max length per the html maxlength attribute
    var PAUSE = 500;
    var BLUR_TIMEOUT = 200;

    // string constants
    var REQUIRED_CLASS = 'autocomplete-required';
    var TEXT_SEARCHING = 'Searching...';
    var TEXT_NORESULTS = 'No results found';
    var TEMPLATE_URL = '/angucomplete-alt/index.html';

    // Set the default template for this directive
    $templateCache.put(TEMPLATE_URL, '<div class="angucomplete-holder" ng-class="{\'angucomplete-dropdown-visible\': showDropdown}">' + '  <input id="{{id}}_value" name="{{inputName}}" tabindex="{{fieldTabindex}}" ng-class="{\'angucomplete-input-not-empty\': notEmpty}" ng-model="searchStr" ng-disabled="disableInput" type="{{inputType}}" placeholder="{{placeholder}}" maxlength="{{maxlength}}" ng-focus="onFocusHandler()" class="{{inputClass}}" ng-focus="resetHideResults()" ng-blur="hideResults($event)" autocapitalize="off" autocorrect="off" autocomplete="off" ng-change="inputChangeHandler(searchStr)"/>' + '  <div id="{{id}}_dropdown" class="angucomplete-dropdown" ng-show="showDropdown">' + '    <div class="angucomplete-searching" ng-show="searching" ng-bind="textSearching"></div>' + '    <div class="angucomplete-searching" ng-show="!searching && (!results || results.length == 0)" ng-bind="textNoResults"></div>' + '    <div class="angucomplete-row" ng-repeat="result in results" ng-click="selectResult(result)" ng-mouseenter="hoverRow($index)" ng-class="{\'angucomplete-selected-row\': $index == currentIndex}">' + '      <div ng-if="imageField" class="angucomplete-image-holder">' + '        <img ng-if="result.image && result.image != \'\'" ng-src="{{result.image}}" class="angucomplete-image"/>' + '        <div ng-if="!result.image && result.image != \'\'" class="angucomplete-image-default"></div>' + '      </div>' + '      <div class="angucomplete-title" ng-if="matchClass" ng-bind-html="result.title"></div>' + '      <div class="angucomplete-title" ng-if="!matchClass">{{ result.title }}</div>' + '      <div ng-if="matchClass && result.description && result.description != \'\'" class="angucomplete-description" ng-bind-html="result.description"></div>' + '      <div ng-if="!matchClass && result.description && result.description != \'\'" class="angucomplete-description">{{result.description}}</div>' + '    </div>' + '  </div>' + '</div>');

    function link(scope, elem, attrs, ctrl) {
      var inputField = elem.find('input');
      var minlength = MIN_LENGTH;
      var searchTimer = null;
      var hideTimer;
      var requiredClassName = REQUIRED_CLASS;
      var responseFormatter;
      var validState = null;
      var httpCanceller = null;
      var dd = elem[0].querySelector('.angucomplete-dropdown');
      var isScrollOn = false;
      var mousedownOn = null;
      var unbindInitialValue;
      var displaySearching;
      var displayNoResults;

      elem.on('mousedown', function (event) {
        if (event.target.id) {
          mousedownOn = event.target.id;
          if (mousedownOn === scope.id + '_dropdown') {
            document.body.addEventListener('click', clickoutHandlerForDropdown);
          }
        } else {
          mousedownOn = event.target.className;
        }
      });

      scope.currentIndex = scope.focusFirst ? 0 : null;
      scope.searching = false;
      unbindInitialValue = scope.$watch('initialValue', function (newval) {
        if (newval) {
          // remove scope listener
          unbindInitialValue();
          // change input
          handleInputChange(newval, true);
        }
      });

      scope.$watch('fieldRequired', function (newval, oldval) {
        if (newval !== oldval) {
          if (!newval) {
            ctrl[scope.inputName].$setValidity(requiredClassName, true);
          } else if (!validState || scope.currentIndex === -1) {
            handleRequired(false);
          } else {
            handleRequired(true);
          }
        }
      });

      scope.$on('angucomplete-alt:clearInput', function (event, elementId) {
        if (!elementId || elementId === scope.id) {
          scope.searchStr = null;
          callOrAssign();
          handleRequired(false);
          clearResults();
        }
      });

      scope.$on('angucomplete-alt:changeInput', function (event, elementId, newval) {
        if (!!elementId && elementId === scope.id) {
          handleInputChange(newval);
        }
      });

      function handleInputChange(newval, initial) {
        if (newval) {
          if ((typeof newval === 'undefined' ? 'undefined' : _typeof(newval)) === 'object') {
            scope.searchStr = extractTitle(newval);
            callOrAssign({ originalObject: newval });
          } else if (typeof newval === 'string' && newval.length > 0) {
            scope.searchStr = newval;
          } else {
            if (console && console.error) {
              console.error('Tried to set ' + (!!initial ? 'initial' : '') + ' value of angucomplete to', newval, 'which is an invalid value');
            }
          }

          handleRequired(true);
        }
      }

      // #194 dropdown list not consistent in collapsing (bug).
      function clickoutHandlerForDropdown(event) {
        mousedownOn = null;
        scope.hideResults(event);
        document.body.removeEventListener('click', clickoutHandlerForDropdown);
      }

      // for IE8 quirkiness about event.which
      function ie8EventNormalizer(event) {
        return event.which ? event.which : event.keyCode;
      }

      function callOrAssign(value) {
        if (typeof scope.selectedObject === 'function') {
          scope.selectedObject(value, scope.selectedObjectData);
        } else {
          scope.selectedObject = value;
        }

        if (value) {
          handleRequired(true);
        } else {
          handleRequired(false);
        }
      }

      function callFunctionOrIdentity(fn) {
        return function (data) {
          return scope[fn] ? scope[fn](data) : data;
        };
      }

      function setInputString(str) {
        callOrAssign({ originalObject: str });

        if (scope.clearSelected) {
          scope.searchStr = null;
        }
        clearResults();
      }

      function extractTitle(data) {
        // split title fields and run extractValue for each and join with ' '
        return scope.titleField.split(',').map(function (field) {
          return extractValue(data, field);
        }).join(' ');
      }

      function extractValue(obj, key) {
        var keys, result;
        if (key) {
          keys = key.split('.');
          result = obj;
          for (var i = 0; i < keys.length; i++) {
            result = result[keys[i]];
          }
        } else {
          result = obj;
        }
        return result;
      }

      function findMatchString(target, str) {
        var result, matches, re;
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
        // Escape user input to be treated as a literal string within a regular expression
        re = new RegExp(str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        if (!target) {
          return;
        }
        if (!target.match || !target.replace) {
          target = target.toString();
        }
        matches = target.match(re);
        if (matches) {
          result = target.replace(re, '<span class="' + scope.matchClass + '">' + matches[0] + '</span>');
        } else {
          result = target;
        }
        return $sce.trustAsHtml(result);
      }

      function handleRequired(valid) {
        scope.notEmpty = valid;
        validState = scope.searchStr;
        if (scope.fieldRequired && ctrl && scope.inputName) {
          ctrl[scope.inputName].$setValidity(requiredClassName, valid);
        }
      }

      function keyupHandler(event) {
        var which = ie8EventNormalizer(event);
        if (which === KEY_LF || which === KEY_RT) {
          // do nothing
          return;
        }

        if (which === KEY_UP || which === KEY_EN) {
          event.preventDefault();
        } else if (which === KEY_DW) {
          event.preventDefault();
          if (!scope.showDropdown && scope.searchStr && scope.searchStr.length >= minlength) {
            initResults();
            scope.searching = true;
            searchTimerComplete(scope.searchStr);
          }
        } else if (which === KEY_ES) {
          clearResults();
          scope.$apply(function () {
            inputField.val(scope.searchStr);
          });
        } else {
          if (minlength === 0 && !scope.searchStr) {
            return;
          }

          if (!scope.searchStr || scope.searchStr === '') {
            scope.showDropdown = false;
          } else if (scope.searchStr.length >= minlength) {
            initResults();

            if (searchTimer) {
              $timeout.cancel(searchTimer);
            }

            scope.searching = true;

            searchTimer = $timeout(function () {
              searchTimerComplete(scope.searchStr);
            }, scope.pause);
          }

          if (validState && validState !== scope.searchStr && !scope.clearSelected) {
            scope.$apply(function () {
              callOrAssign();
            });
          }
        }
      }

      function handleOverrideSuggestions(event) {
        if (scope.overrideSuggestions && !(scope.selectedObject && scope.selectedObject.originalObject === scope.searchStr)) {
          if (event) {
            event.preventDefault();
          }

          // cancel search timer
          $timeout.cancel(searchTimer);
          // cancel http request
          cancelHttpRequest();

          setInputString(scope.searchStr);
        }
      }

      function dropdownRowOffsetHeight(row) {
        var css = getComputedStyle(row);
        return row.offsetHeight + parseInt(css.marginTop, 10) + parseInt(css.marginBottom, 10);
      }

      function dropdownHeight() {
        return dd.getBoundingClientRect().top + parseInt(getComputedStyle(dd).maxHeight, 10);
      }

      function dropdownRow() {
        return elem[0].querySelectorAll('.angucomplete-row')[scope.currentIndex];
      }

      function dropdownRowTop() {
        return dropdownRow().getBoundingClientRect().top - (dd.getBoundingClientRect().top + parseInt(getComputedStyle(dd).paddingTop, 10));
      }

      function dropdownScrollTopTo(offset) {
        dd.scrollTop = dd.scrollTop + offset;
      }

      function updateInputField() {
        var current = scope.results[scope.currentIndex];
        if (scope.matchClass) {
          inputField.val(extractTitle(current.originalObject));
        } else {
          inputField.val(current.title);
        }
      }

      function keydownHandler(event) {
        var which = ie8EventNormalizer(event);
        var row = null;
        var rowTop = null;

        if (which === KEY_EN && scope.results) {
          if (scope.currentIndex >= 0 && scope.currentIndex < scope.results.length) {
            event.preventDefault();
            scope.selectResult(scope.results[scope.currentIndex]);
          } else {
            handleOverrideSuggestions(event);
            clearResults();
          }
          scope.$apply();
        } else if (which === KEY_DW && scope.results) {
          event.preventDefault();
          if (scope.currentIndex + 1 < scope.results.length && scope.showDropdown) {
            scope.$apply(function () {
              scope.currentIndex++;
              updateInputField();
            });

            if (isScrollOn) {
              row = dropdownRow();
              if (dropdownHeight() < row.getBoundingClientRect().bottom) {
                dropdownScrollTopTo(dropdownRowOffsetHeight(row));
              }
            }
          }
        } else if (which === KEY_UP && scope.results) {
          event.preventDefault();
          if (scope.currentIndex >= 1) {
            scope.$apply(function () {
              scope.currentIndex--;
              updateInputField();
            });

            if (isScrollOn) {
              rowTop = dropdownRowTop();
              if (rowTop < 0) {
                dropdownScrollTopTo(rowTop - 1);
              }
            }
          } else if (scope.currentIndex === 0) {
            scope.$apply(function () {
              scope.currentIndex = -1;
              inputField.val(scope.searchStr);
            });
          }
        } else if (which === KEY_TAB) {
          if (scope.results && scope.results.length > 0 && scope.showDropdown) {
            if (scope.currentIndex === -1 && scope.overrideSuggestions) {
              // intentionally not sending event so that it does not
              // prevent default tab behavior
              handleOverrideSuggestions();
            } else {
              if (scope.currentIndex === -1) {
                scope.currentIndex = 0;
              }
              scope.selectResult(scope.results[scope.currentIndex]);
              scope.$digest();
            }
          } else {
            // no results
            // intentionally not sending event so that it does not
            // prevent default tab behavior
            if (scope.searchStr && scope.searchStr.length > 0) {
              handleOverrideSuggestions();
            }
          }
        } else if (which === KEY_ES) {
          // This is very specific to IE10/11 #272
          // without this, IE clears the input text
          event.preventDefault();
        }
      }

      function httpSuccessCallbackGen(str) {
        return function (responseData, status, headers, config) {
          // normalize return obejct from promise
          if (!status && !headers && !config && responseData.data) {
            responseData = responseData.data;
          }
          scope.searching = false;
          processResults(extractValue(responseFormatter(responseData), scope.remoteUrlDataField), str);
        };
      }

      function httpErrorCallback(errorRes, status, headers, config) {
        scope.searching = false;

        // cancelled/aborted
        if (status === 0 || status === -1) {
          return;
        }

        // normalize return obejct from promise
        if (!status && !headers && !config) {
          status = errorRes.status;
        }
        if (scope.remoteUrlErrorCallback) {
          scope.remoteUrlErrorCallback(errorRes, status, headers, config);
        } else {
          if (console && console.error) {
            console.error('http error');
          }
        }
      }

      function cancelHttpRequest() {
        if (httpCanceller) {
          httpCanceller.resolve();
        }
      }

      function getRemoteResults(str) {
        var params = {},
            url = scope.remoteUrl + encodeURIComponent(str);
        if (scope.remoteUrlRequestFormatter) {
          params = { params: scope.remoteUrlRequestFormatter(str) };
          url = scope.remoteUrl;
        }
        if (!!scope.remoteUrlRequestWithCredentials) {
          params.withCredentials = true;
        }
        cancelHttpRequest();
        httpCanceller = $q.defer();
        params.timeout = httpCanceller.promise;
        $http.get(url, params).success(httpSuccessCallbackGen(str)).error(httpErrorCallback);
      }

      function getRemoteResultsWithCustomHandler(str) {
        cancelHttpRequest();

        httpCanceller = $q.defer();

        scope.remoteApiHandler(str, httpCanceller.promise).then(httpSuccessCallbackGen(str)).catch(httpErrorCallback);

        /* IE8 compatible
        scope.remoteApiHandler(str, httpCanceller.promise)
          ['then'](httpSuccessCallbackGen(str))
          ['catch'](httpErrorCallback);
        */
      }

      function clearResults() {
        scope.showDropdown = false;
        scope.results = [];
        if (dd) {
          dd.scrollTop = 0;
        }
      }

      function initResults() {
        scope.showDropdown = displaySearching;
        scope.currentIndex = scope.focusFirst ? 0 : -1;
        scope.results = [];
      }

      function getLocalResults(str) {
        var i,
            match,
            s,
            value,
            searchFields = scope.searchFields.split(','),
            matches = [];
        if (typeof scope.parseInput() !== 'undefined') {
          str = scope.parseInput()(str);
        }
        for (i = 0; i < scope.localData.length; i++) {
          match = false;

          for (s = 0; s < searchFields.length; s++) {
            value = extractValue(scope.localData[i], searchFields[s]) || '';
            match = match || value.toString().toLowerCase().indexOf(str.toString().toLowerCase()) >= 0;
          }

          if (match) {
            matches[matches.length] = scope.localData[i];
          }
        }
        return matches;
      }

      function checkExactMatch(result, obj, str) {
        if (!str) {
          return false;
        }
        for (var key in obj) {
          if (obj[key].toLowerCase() === str.toLowerCase()) {
            scope.selectResult(result);
            return true;
          }
        }
        return false;
      }

      function searchTimerComplete(str) {
        // Begin the search
        if (!str || str.length < minlength) {
          return;
        }
        if (scope.localData) {
          scope.$apply(function () {
            var matches;
            if (typeof scope.localSearch() !== 'undefined') {
              matches = scope.localSearch()(str, scope.localData);
            } else {
              matches = getLocalResults(str);
            }
            scope.searching = false;
            processResults(matches, str);
          });
        } else if (scope.remoteApiHandler) {
          getRemoteResultsWithCustomHandler(str);
        } else {
          getRemoteResults(str);
        }
      }

      function processResults(responseData, str) {
        var i, description, image, text, formattedText, formattedDesc;

        if (responseData && responseData.length > 0) {
          scope.results = [];

          for (i = 0; i < responseData.length; i++) {
            if (scope.titleField && scope.titleField !== '') {
              text = formattedText = extractTitle(responseData[i]);
            }

            description = '';
            if (scope.descriptionField) {
              description = formattedDesc = extractValue(responseData[i], scope.descriptionField);
            }

            image = '';
            if (scope.imageField) {
              image = extractValue(responseData[i], scope.imageField);
            }

            if (scope.matchClass) {
              formattedText = findMatchString(text, str);
              formattedDesc = findMatchString(description, str);
            }

            scope.results[scope.results.length] = {
              title: formattedText,
              description: formattedDesc,
              image: image,
              originalObject: responseData[i]
            };
          }
        } else {
          scope.results = [];
        }

        if (scope.autoMatch && scope.results.length === 1 && checkExactMatch(scope.results[0], { title: text, desc: description || '' }, scope.searchStr)) {
          scope.showDropdown = false;
        } else if (scope.results.length === 0 && !displayNoResults) {
          scope.showDropdown = false;
        } else {
          scope.showDropdown = true;
        }
      }

      function showAll() {
        if (scope.localData) {
          processResults(scope.localData, '');
        } else if (scope.remoteApiHandler) {
          getRemoteResultsWithCustomHandler('');
        } else {
          getRemoteResults('');
        }
      }

      scope.onFocusHandler = function () {
        if (scope.focusIn) {
          scope.focusIn();
        }
        if (minlength === 0 && (!scope.searchStr || scope.searchStr.length === 0)) {
          scope.currentIndex = scope.focusFirst ? 0 : scope.currentIndex;
          scope.showDropdown = true;
          showAll();
        }
      };

      scope.hideResults = function () {
        if (mousedownOn && (mousedownOn === scope.id + '_dropdown' || mousedownOn.indexOf('angucomplete') >= 0)) {
          mousedownOn = null;
        } else {
          hideTimer = $timeout(function () {
            clearResults();
            scope.$apply(function () {
              if (scope.searchStr && scope.searchStr.length > 0) {
                inputField.val(scope.searchStr);
              }
            });
          }, BLUR_TIMEOUT);
          cancelHttpRequest();

          if (scope.focusOut) {
            scope.focusOut();
          }

          if (scope.overrideSuggestions) {
            if (scope.searchStr && scope.searchStr.length > 0 && scope.currentIndex === -1) {
              handleOverrideSuggestions();
            }
          }
        }
      };

      scope.resetHideResults = function () {
        if (hideTimer) {
          $timeout.cancel(hideTimer);
        }
      };

      scope.hoverRow = function (index) {
        scope.currentIndex = index;
      };

      scope.selectResult = function (result) {
        // Restore original values
        if (scope.matchClass) {
          result.title = extractTitle(result.originalObject);
          result.description = extractValue(result.originalObject, scope.descriptionField);
        }

        if (scope.clearSelected) {
          scope.searchStr = null;
        } else {
          scope.searchStr = result.title;
        }
        callOrAssign(result);
        clearResults();
      };

      scope.inputChangeHandler = function (str) {
        if (str.length < minlength) {
          cancelHttpRequest();
          clearResults();
        } else if (str.length === 0 && minlength === 0) {
          scope.searching = false;
          showAll();
        }

        if (scope.inputChanged) {
          str = scope.inputChanged(str);
        }
        return str;
      };

      // check required
      if (scope.fieldRequiredClass && scope.fieldRequiredClass !== '') {
        requiredClassName = scope.fieldRequiredClass;
      }

      // check min length
      if (scope.minlength && scope.minlength !== '') {
        minlength = parseInt(scope.minlength, 10);
      }

      // check pause time
      if (!scope.pause) {
        scope.pause = PAUSE;
      }

      // check clearSelected
      if (!scope.clearSelected) {
        scope.clearSelected = false;
      }

      // check override suggestions
      if (!scope.overrideSuggestions) {
        scope.overrideSuggestions = false;
      }

      // check required field
      if (scope.fieldRequired && ctrl) {
        // check initial value, if given, set validitity to true
        if (scope.initialValue) {
          handleRequired(true);
        } else {
          handleRequired(false);
        }
      }

      scope.inputType = attrs.type ? attrs.type : 'text';

      // set strings for "Searching..." and "No results"
      scope.textSearching = attrs.textSearching ? attrs.textSearching : TEXT_SEARCHING;
      scope.textNoResults = attrs.textNoResults ? attrs.textNoResults : TEXT_NORESULTS;
      displaySearching = scope.textSearching === 'false' ? false : true;
      displayNoResults = scope.textNoResults === 'false' ? false : true;

      // set max length (default to maxlength deault from html
      scope.maxlength = attrs.maxlength ? attrs.maxlength : MAX_LENGTH;

      // register events
      inputField.on('keydown', keydownHandler);
      inputField.on('keyup', keyupHandler);

      // set response formatter
      responseFormatter = callFunctionOrIdentity('remoteUrlResponseFormatter');

      // set isScrollOn
      $timeout(function () {
        var css = getComputedStyle(dd);
        isScrollOn = css.maxHeight && css.overflowY === 'auto';
      });
    }

    return {
      restrict: 'EA',
      require: '^?form',
      scope: {
        selectedObject: '=',
        selectedObjectData: '=',
        disableInput: '=',
        initialValue: '=',
        localData: '=',
        localSearch: '&',
        remoteUrlRequestFormatter: '=',
        remoteUrlRequestWithCredentials: '@',
        remoteUrlResponseFormatter: '=',
        remoteUrlErrorCallback: '=',
        remoteApiHandler: '=',
        id: '@',
        type: '@',
        placeholder: '@',
        textSearching: '@',
        textNoResults: '@',
        remoteUrl: '@',
        remoteUrlDataField: '@',
        titleField: '@',
        descriptionField: '@',
        imageField: '@',
        inputClass: '@',
        pause: '@',
        searchFields: '@',
        minlength: '@',
        matchClass: '@',
        clearSelected: '@',
        overrideSuggestions: '@',
        fieldRequired: '=',
        fieldRequiredClass: '@',
        inputChanged: '=',
        autoMatch: '@',
        focusOut: '&',
        focusIn: '&',
        fieldTabindex: '@',
        inputName: '@',
        focusFirst: '@',
        parseInput: '&'
      },
      templateUrl: function templateUrl(element, attrs) {
        return attrs.templateUrl || TEMPLATE_URL;
      },
      compile: function compile(tElement) {
        var startSym = $interpolate.startSymbol();
        var endSym = $interpolate.endSymbol();
        if (!(startSym === '{{' && endSym === '}}')) {
          var interpolatedHtml = tElement.html().replace(/\{\{/g, startSym).replace(/\}\}/g, endSym);
          tElement.html(interpolatedHtml);
        }
        return link;
      }
    };
  }]);
});
'use strict';

angular.module('debounce', []).service('debounce', ['$timeout', function ($timeout) {
  return function (func, wait, immediate, invokeApply) {
    var timeout, args, context, result;
    function debounce() {
      /* jshint validthis:true */
      context = this;
      args = arguments;
      var later = function later() {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
        }
      };
      var callNow = immediate && !timeout;
      if (timeout) {
        $timeout.cancel(timeout);
      }
      timeout = $timeout(later, wait, invokeApply);
      if (callNow) {
        result = func.apply(context, args);
      }
      return result;
    }
    debounce.cancel = function () {
      $timeout.cancel(timeout);
      timeout = null;
    };
    return debounce;
  };
}]).directive('debounce', ['debounce', '$parse', function (debounce, $parse) {
  return {
    require: 'ngModel',
    priority: 999,
    link: function link($scope, $element, $attrs, ngModelController) {
      var debounceDuration = $parse($attrs.debounce)($scope);
      var immediate = !!$parse($attrs.immediate)($scope);
      var debouncedValue, pass;
      var prevRender = ngModelController.$render.bind(ngModelController);
      var commitSoon = debounce(function (viewValue) {
        pass = true;
        ngModelController.$$lastCommittedViewValue = debouncedValue;
        ngModelController.$setViewValue(viewValue);
        pass = false;
      }, parseInt(debounceDuration, 10), immediate);
      ngModelController.$render = function () {
        prevRender();
        commitSoon.cancel();
        //we must be first parser for this to work properly,
        //so we have priority 999 so that we unshift into parsers last
        debouncedValue = this.$viewValue;
      };
      ngModelController.$parsers.unshift(function (value) {
        if (pass) {
          debouncedValue = value;
          return value;
        } else {
          commitSoon(ngModelController.$viewValue);
          return debouncedValue;
        }
      });
    }
  };
}]);
'use strict';

(function () {
    angular.module('skyApp.utils').directive('ngMaterialLoader', [ngMaterialLoaderFunc]);

    function ngMaterialLoaderFunc() {

        return {
            restrict: 'EA',
            template: '<md-progress-circular class="md-accent loading-icon-align" md-mode="indeterminate" ng-show="show" md-diameter="100"></md-progress-circular>',
            scope: {
                show: "="
            },
            link: function link(scope, ele, attrs) {
                scope.$watch("show", function (newval, oldval) {
                    if (newval != oldval) {
                        scope.show = !!newval;
                    }
                });
            }
        };
    };
})();
'use strict';

(function () {
    angular.module('skyApp.utils').directive('reuseModal', ['$uibModal', '$http', '$parse', 'TEMPLATE_DIR', ReusableModal]);

    function ReusableModal($uibModal, $http, $parse, TEMPLATE_DIR) {

        return {
            restrict: 'A',
            transclude: true,
            template: '<a ng-click="open()" ng-transclude></a>',
            scope: {
                useCtrl: "@"
            },
            link: function link(scope, ele, attrs) {

                scope.open = function (size) {

                    var modalInstance = $uibModal.open({
                        templateUrl: TEMPLATE_DIR + attrs.instanceTemplate,
                        controller: 'ModalInstanceCtrl',
                        size: 'md',
                        keyboard: false,
                        backdrop: true,
                        windowClass: 'app-modal-window'
                    });

                    modalInstance.result.then(function (result) {
                        debugger;
                        console.log('Finished');
                    });
                };
            }
        };
    };
    angular.module('skyApp.utils').controller('ModalInstanceCtrl', ['$scope', '$uibModalInstance', '$http', '$filter', ModalInstanceCtrl]);

    function ModalInstanceCtrl($scope, $uibModalInstance, $http, $filter) {
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };
})();
'use strict';

(function () {

  angular.module('skyApp.weather', []);
})();
'use strict';

(function () {

    angular.module('skyApp.weather').controller('WeatherController', WeatherController);

    WeatherController.$inject = ['$q', '$scope', '$log', 'WeatherService', 'UserService', 'MosaicDataService', '$interval'];

    // 'operations'
    function WeatherController($q, $scope, $log, WeatherService, UserService, MosaicDataService, $interval) {
        var WC = this;
        WC.activate = activate;
        WC.beforeRender = beforeRender;
        var opsDefer = $q.defer();
        WC.opsMap = opsDefer.promise;

        WC.activate();

        function activate() {
            // console.log(operations);
            angular.extend($scope, {
                // operations: operations,
                setOperation: setOperation,
                // location: {
                //     name:'Napa, CA', lat: 38.431175, lng: -122.3476730
                // },
                data: {
                    date: new Date()
                }
            });

            UserService.getOrg().then(function (org) {
                return MosaicDataService.getOperations(org.orgId);
            }).then(function (ops) {
                return ops.reduce(function (p, c) {
                    return p[c.opId] = c, p;
                }, {});
            }).then(opsDefer.resolve);
        }

        function setOperation(operation) {

            WC.opsMap.then(function (opsMap) {
                console.log(opsMap);
                return opsMap[operation];
            }).then(function (op) {
                console.log(op);
                $scope.location = {
                    name: op.opName,
                    lat: op.homeCoord.lat,
                    lng: op.homeCoord.lng
                };
                return op.homeCoord || {
                    lat: (op.bbox[0] + op.bbox[2]) / 2,
                    lng: (op.bbox[1] + op.bbox[3]) / 2
                };
            }).then(WeatherService.getForecast).then(function (forecasts) {
                var forecast = forecasts[0];
                $scope.weatherData = forecast;
            }).catch(function (err) {
                return console.log;
            });
        }

        function beforeRender($view, $dates, $leftDate, $upDate, $rightDate) {
            angular.noop();
        }
    };
})();
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

(function () {

    angular.module('skyApp.weather').provider('WeatherService', [WeatherServiceProvider]);

    function WeatherServiceProvider() {

        var dayMillis = 86400000;

        var self = this;
        self.wk = null;
        self.setup = function (val) {
            self.wk = val;
        };

        self.$get = ['$http', '$q', '$cacheFactory', '$log', function ($http, $q, $cacheFactory, $log) {
            var forecastCache = $cacheFactory('forecast', { capacity: 5 });
            var service = {
                getForecast: getForecast,
                getHistorical: getHistorical,
                getElevation: getElevation,
                getGraphData: getGraphData
            };

            return service;

            function getHistorical() {
                return $http({
                    method: 'GET',
                    url: "app/weather/historical.json"
                }).then(function (response) {
                    return response.data.locations.map(processHistorical).reduce(function (p, c) {
                        return p.concat(c);
                    }, []);
                });
            }

            function getElevation(location) {
                var payloadPromise = validateLocation(location);

                return payloadPromise.then(function (body) {
                    return $http({
                        method: 'GET',
                        url: 'https://4x8ke86kga.execute-api.us-east-1.amazonaws.com/dev/elevation/' + location.lat + '/' + location.lng,
                        headers: {
                            "X-Api-Key": self.wk || undefined
                        }
                    });
                }).then(function (response) {
                    return location;
                }).then(function (loc) {
                    return $http({
                        method: 'POST',
                        url: 'https://4x8ke86kga.execute-api.us-east-1.amazonaws.com/dev/elevation',
                        data: payloadPromise,
                        headers: {
                            "X-Api-Key": self.wk || undefined
                        }
                    });
                });
            }

            function validateLocation(location) {
                return $q(function (resolve, reject) {
                    var body = { "latlons": [] };
                    switch (typeof location === 'undefined' ? 'undefined' : _typeof(location)) {
                        case "object":
                            if (!!!location.lat || !!!location.lng) {
                                reject('argument must be a latlngLiteral or array of latlngLiterals');
                            }
                            body.latlons.push(function (l) {
                                return [l.lat, l.lng];
                            }(location));
                            resolve(body);
                            break;
                        case "array":
                            body.latlons.push(location.filter(function (l) {
                                return !!l.lat && !!l.lng ? true : false;
                            }).map(function (l) {
                                return [l.lat, l.lng];
                            }));
                            resolve(body);
                            break;
                        case "undefined":
                        default:
                            reject('argument must be a latlngLiteral or array of latlngLiterals');
                    }
                    resolve(body);
                });
            }

            function getForecasts(locations) {
                return $q.all(locations.map(getForecast));
            }

            function getForecast(location) {
                return $q(function (resolve, reject) {

                    // prefer multiple GET requests to a POST because the GETs are automatically cached
                    //      (all requests to same URL– even before response – return the same Promise,
                    //       which is resolved by the eventual response)
                    $http({
                        method: 'GET',
                        url: 'https://4x8ke86kga.execute-api.us-east-1.amazonaws.com/dev/forecast/' + location.lat + '/' + location.lng,
                        headers: { "X-Api-Key": self.wk },
                        cache: forecastCache
                    }).then(function (response) {
                        return resolve(response.data.forecast);
                    }).catch(function (err) {
                        console.log(err);
                        reject(err);
                    });
                });
            }

            // function processLocation(location) {

            //     var result = {};
            //     result.coord = {lat: location.lat, lng: location.lon};
            //     result.name = location.name;
            //     result.startTime = new Date(location.start);
            //     result.stopTime = new Date(location.stop);
            //     return processHistorical(location)
            //     .then(w => {
            //         result.records = w;
            //         return result;
            //     });
            // }

            function processHistorical(location) {
                var weather = location.weather,
                    start = location.start,
                    stop = location.stop,
                    name = location.name,
                    lat = location.lat,
                    lng = location.lon;
                (!!!lat || !!!lng) && console.log('null found', location);

                var startMillis = new Date(start).getTime();
                var stopMillis = new Date(stop).getTime();

                var keys = [];angular.forEach(weather, function (_, key) {
                    return keys.push(key);
                });
                var properties = keys.map(function (k) {
                    return weather[k];
                });
                var l = properties.length;

                var length = properties.map(function (v) {
                    return v.length;
                }).reduce(function (p, c) {
                    return p + c / l;
                }, 0);

                // for every day (element of result array)
                return weather.gdd.map(function (val, dayIndex) {
                    // create a day object w/ start date and # days elapsed
                    var record = {
                        date: new Date(startMillis + dayIndex * dayMillis),
                        name: name,
                        lat: lat,
                        lng: lng
                    };

                    // for each weather property, set this day's corresponding property
                    // equal to the correct index into the original property array.
                    //
                    //    transforms from this         to this
                    //      {                               [{
                    //          "tmin": [],                     "tmin": ,
                    //          "gdd": [],                      "gdd": ,
                    //          "precip accum": [],             "precip accum": ,
                    //          "wind speed": [],               "wind speed": ,
                    //          "cloud cover": [],              "cloud cover": ,
                    //          "wind bearing": [],             "wind bearing": ,
                    //          "tmax": [],                     "tmax": ,
                    //          "humidity": []                  "humidity": ,
                    //      }                               }]

                    keys.forEach(function (k) {
                        record[angular.element.camelCase(k.replace(' ', '-'))] = weather[k][dayIndex];
                    });
                    return record;
                }).filter(function (d) {
                    return 2015 == d.date.getUTCFullYear();
                });
            }

            function getGraphData(config) {
                return $q.all(config.map(function (c) {
                    return getGraphDatum(c);
                }));
            }

            function getGraphDatum(config) {

                return service.getForecast(config.location).then(function (datum) {
                    var forecast = datum[0].daily.data,
                        xc = config.xConfig,
                        yc = config.yConfig;

                    function getConversion(_yc, i) {
                        return function (inval) {
                            switch (_yc.yParams[i].param) {
                                case 'temperatureMin':
                                case 'temperatureMax':
                                case 'apparentTemperatureMin':
                                case 'apparentTemperatureMax':
                                    return _yc.unit === 'F' && datum[0].flags.units === 'si' ? Number((inval * 9 / 5 + 32).toFixed(1)) : inval;
                                    break;
                                case 'precipProbability':
                                case 'humidity':
                                case 'cloudCover':
                                    return _yc.unit === '%' ? Math.round(inval * 100) : Number(inval.toPrecision(3));
                                    break;
                                default:
                                    return inval;
                            }
                        };
                    }

                    config.chartdata = yc.yParams.map(function (c, i) {
                        var newValues = forecast.map(function (d) {
                            return {
                                x: d[xc.param],
                                y: getConversion(yc, i)(d[c.param])
                            };
                        });
                        return angular.extend(c, {
                            values: newValues
                        });
                    });
                    return config;
                });
            }
        }];
    };
})();
'use strict';

(function () {

    angular.module('skyApp.weather').filter('degCToDegF', function () {
        return function (forecast) {

            function mapper(datum) {
                var out = angular.copy(datum);
                out.temperatureMin = datum.temperatureMin * 9 / 5 + 32;
                out.apparentTemperatureMin = datum.apparentTemperatureMin * 9 / 5 + 32;
                out.temperatureMax = datum.temperatureMax * 9 / 5 + 32;
                out.apparentTemperatureMax = datum.apparentTemperatureMax * 9 / 5 + 32;
                out.temperature = datum.temperature * 9 / 5 + 32;
                return out;
            }

            angular.forEach(forecast, function (value, key) {
                if (key.endsWith('ly')) {
                    if (!!value.data) {
                        forecast[key].data = value.data.map(mapper);
                    } else {
                        forecast[key] = mapper(value);
                    }
                }
            });
            return forecast;
        };
    }).directive('forecastWidget', ['ForecastService', 'degCToDegFFilter', 'TEMPLATE_DIR', ForecastWidget]);

    function ForecastWidget(ForecastService, degCToDegFFilter, TEMPLATE_DIR) {
        ForecastWidgetController.$inject = ['$scope', '$element', '$attrs'];

        return {
            restrict: 'E',
            templateUrl: TEMPLATE_DIR + 'weather.widget.partial.html',
            link: ForecastWidgetController
        };

        function ForecastWidgetController(scope, element, attrs) {
            var forecastData = false;

            ForecastService.generateWidget({
                units: 'si',
                title: '',
                lat: scope.location.lat, lon: scope.location.lng
            });

            var unwatch = scope.$watch('weatherData', function (newValue, oldValue) {
                // console.log(newValue,oldValue);
                if (newValue !== oldValue || !!!forecastData && !!newValue) {
                    forecastData = true;
                    var convertedData = degCToDegFFilter(newValue);
                    var fs = ForecastService.setForecast(newValue);
                    unwatch();
                }
            });

            function error(err) {
                console.warn('ERROR(' + err.code + '): ' + err.message);
            };
        }
    }
})();
'use strict';

(function () {
    /* jshint ignore:start */
    angular.module('skyApp.weather').factory('ForecastService', ['$http', '$log', ForecastService]);

    function ForecastService($http, $log) {

        var service = {};

        // Main methods
        service.generateWidget = generateWidget;
        service.setForecast = setForecast;

        var Skycons;
        (function (e) {
            "use strict";

            function u(e, t, n, r) {
                e.beginPath(), e.arc(t, n, r, 0, s, !1), e.fill();
            }
            function a(e, t, n, r, i) {
                e.beginPath(), e.moveTo(t, n), e.lineTo(r, i), e.stroke();
            }
            function f(e, t, n, r, i, o, a, f) {
                var l = Math.cos(t * s),
                    c = Math.sin(t * s);
                f -= a, u(e, n - c * i, r + l * o + f * .5, a + (1 - l * .5) * f);
            }
            function l(e, t, n, r, i, s, o, u) {
                var a;
                for (a = 5; a--;) {
                    f(e, t + a / 5, n, r, i, s, o, u);
                }
            }
            function c(e, t, n, r, i, s, o) {
                t /= 3e4;
                var u = i * .21,
                    a = i * .12,
                    f = i * .24,
                    c = i * .28;
                e.fillStyle = o, l(e, t, n, r, u, a, f, c), e.globalCompositeOperation = "destination-out", l(e, t, n, r, u, a, f - s, c - s), e.globalCompositeOperation = "source-over";
            }
            function h(e, t, n, r, i, o, u) {
                t /= 12e4;
                var f = i * .25 - o * .5,
                    l = i * .32 + o * .5,
                    c = i * .5 - o * .5,
                    h,
                    p,
                    d,
                    v;
                e.strokeStyle = u, e.lineWidth = o, e.lineCap = "round", e.lineJoin = "round", e.beginPath(), e.arc(n, r, f, 0, s, !1), e.stroke();
                for (h = 8; h--;) {
                    p = (t + h / 8) * s, d = Math.cos(p), v = Math.sin(p), a(e, n + d * l, r + v * l, n + d * c, r + v * c);
                }
            }
            function p(e, t, n, r, i, u, a) {
                t /= 15e3;
                var f = i * .29 - u * .5,
                    l = i * .05,
                    c = Math.cos(t * s),
                    h = c * s / -16;
                e.strokeStyle = a, e.lineWidth = u, e.lineCap = "round", e.lineJoin = "round", n += c * l, e.beginPath(), e.arc(n, r, f, h + s / 8, h + s * 7 / 8, !1), e.arc(n + Math.cos(h) * f * o, r + Math.sin(h) * f * o, f, h + s * 5 / 8, h + s * 3 / 8, !0), e.closePath(), e.stroke();
            }
            function d(e, t, n, r, i, o, u) {
                t /= 1350;
                var a = i * .16,
                    f = s * 11 / 12,
                    l = s * 7 / 12,
                    c,
                    h,
                    p,
                    d;
                e.fillStyle = u;
                for (c = 4; c--;) {
                    h = (t + c / 4) % 1, p = n + (c - 1.5) / 1.5 * (c === 1 || c === 2 ? -1 : 1) * a, d = r + h * h * i, e.beginPath(), e.moveTo(p, d - o * 1.5), e.arc(p, d, o * .75, f, l, !1), e.fill();
                }
            }
            function v(e, t, n, r, i, o, u) {
                t /= 750;
                var f = i * .1875,
                    l = s * 11 / 12,
                    c = s * 7 / 12,
                    h,
                    p,
                    d,
                    v;
                e.strokeStyle = u, e.lineWidth = o * .5, e.lineCap = "round", e.lineJoin = "round";
                for (h = 4; h--;) {
                    p = (t + h / 4) % 1, d = Math.floor(n + (h - 1.5) / 1.5 * (h === 1 || h === 2 ? -1 : 1) * f) + .5, v = r + p * i, a(e, d, v - o * 1.5, d, v + o * 1.5);
                }
            }
            function m(e, t, n, r, i, o, u) {
                t /= 3e3;
                var f = i * .16,
                    l = o * .75,
                    c = t * s * .7,
                    h = Math.cos(c) * l,
                    p = Math.sin(c) * l,
                    d = c + s / 3,
                    v = Math.cos(d) * l,
                    m = Math.sin(d) * l,
                    g = c + s * 2 / 3,
                    y = Math.cos(g) * l,
                    b = Math.sin(g) * l,
                    w,
                    E,
                    S,
                    x;
                e.strokeStyle = u, e.lineWidth = o * .5, e.lineCap = "round", e.lineJoin = "round";
                for (w = 4; w--;) {
                    E = (t + w / 4) % 1, S = n + Math.sin((E + w / 4) * s) * f, x = r + E * i, a(e, S - h, x - p, S + h, x + p), a(e, S - v, x - m, S + v, x + m), a(e, S - y, x - b, S + y, x + b);
                }
            }
            function g(e, t, n, r, i, s, o) {
                t /= 3e4;
                var u = i * .21,
                    a = i * .06,
                    f = i * .21,
                    c = i * .28;
                e.fillStyle = o, l(e, t, n, r, u, a, f, c), e.globalCompositeOperation = "destination-out", l(e, t, n, r, u, a, f - s, c - s), e.globalCompositeOperation = "source-over";
            }
            function w(e, t, n, r, i, o, u) {
                var a = i / 8,
                    f = a / 3,
                    l = 2 * f,
                    c = t % 1 * s,
                    h = Math.cos(c),
                    p = Math.sin(c);
                e.fillStyle = u, e.strokeStyle = u, e.lineWidth = o, e.lineCap = "round", e.lineJoin = "round", e.beginPath(), e.arc(n, r, a, c, c + Math.PI, !1), e.arc(n - f * h, r - f * p, l, c + Math.PI, c, !1), e.arc(n + l * h, r + l * p, f, c + Math.PI, c, !0), e.globalCompositeOperation = "destination-out", e.fill(), e.globalCompositeOperation = "source-over", e.stroke();
            }
            function E(e, t, n, r, i, s, o, u, a) {
                t /= 2500;
                var f = y[o],
                    l = (t + o - b[o].start) % u,
                    c = (t + o - b[o].end) % u,
                    h = (t + o) % u,
                    p,
                    d,
                    v,
                    m;
                e.strokeStyle = a, e.lineWidth = s, e.lineCap = "round", e.lineJoin = "round";
                if (l < 1) {
                    e.beginPath(), l *= f.length / 2 - 1, p = Math.floor(l), l -= p, p *= 2, p += 2, e.moveTo(n + (f[p - 2] * (1 - l) + f[p] * l) * i, r + (f[p - 1] * (1 - l) + f[p + 1] * l) * i);
                    if (c < 1) {
                        c *= f.length / 2 - 1, d = Math.floor(c), c -= d, d *= 2, d += 2;
                        for (m = p; m !== d; m += 2) {
                            e.lineTo(n + f[m] * i, r + f[m + 1] * i);
                        }e.lineTo(n + (f[d - 2] * (1 - c) + f[d] * c) * i, r + (f[d - 1] * (1 - c) + f[d + 1] * c) * i);
                    } else for (m = p; m !== f.length; m += 2) {
                        e.lineTo(n + f[m] * i, r + f[m + 1] * i);
                    }e.stroke();
                } else if (c < 1) {
                    e.beginPath(), c *= f.length / 2 - 1, d = Math.floor(c), c -= d, d *= 2, d += 2, e.moveTo(n + f[0] * i, r + f[1] * i);
                    for (m = 2; m !== d; m += 2) {
                        e.lineTo(n + f[m] * i, r + f[m + 1] * i);
                    }e.lineTo(n + (f[d - 2] * (1 - c) + f[d] * c) * i, r + (f[d - 1] * (1 - c) + f[d + 1] * c) * i), e.stroke();
                }
                h < 1 && (h *= f.length / 2 - 1, v = Math.floor(h), h -= v, v *= 2, v += 2, w(e, t, n + (f[v - 2] * (1 - h) + f[v] * h) * i, r + (f[v - 1] * (1 - h) + f[v + 1] * h) * i, i, s, a));
            }
            var t, n;
            (function () {
                var r = e.requestAnimationFrame || e.webkitRequestAnimationFrame || e.mozRequestAnimationFrame || e.oRequestAnimationFrame || e.msRequestAnimationFrame,
                    i = e.cancelAnimationFrame || e.webkitCancelAnimationFrame || e.mozCancelAnimationFrame || e.oCancelAnimationFrame || e.msCancelAnimationFrame;
                r && i ? (t = function t(e, _t) {
                    function i() {
                        n.value = r(i), e();
                    }
                    var n = {
                        value: null
                    };
                    return i(), n;
                }, n = function n(e) {
                    i(e.value);
                }) : (t = setInterval, n = clearInterval);
            })();
            var r = 500,
                i = 0.08,
                s = 2 * Math.PI,
                o = 2 / Math.sqrt(2),
                y = [[-0.75, -0.18, -0.7219, -0.1527, -0.6971, -0.1225, -0.6739, -0.091, -0.6516, -0.0588, -0.6298, -0.0262, -0.6083, 0.0065, -0.5868, 0.0396, -0.5643, 0.0731, -0.5372, 0.1041, -0.5033, 0.1259, -0.4662, 0.1406, -0.4275, 0.1493, -0.3881, 0.153, -0.3487, 0.1526, -0.3095, 0.1488, -0.2708, 0.1421, -0.2319, 0.1342, -0.1943, 0.1217, -0.16, 0.1025, -0.129, 0.0785, -0.1012, 0.0509, -0.0764, 0.0206, -0.0547, -0.012, -0.0378, -0.0472, -0.0324, -0.0857, -0.0389, -0.1241, -0.0546, -0.1599, -0.0814, -0.1876, -0.1193, -0.1964, -0.1582, -0.1935, -0.1931, -0.1769, -0.2157, -0.1453, -0.229, -0.1085, -0.2327, -0.0697, -0.224, -0.0317, -0.2064, 0.0033, -0.1853, 0.0362, -0.1613, 0.0672, -0.135, 0.0961, -0.1051, 0.1213, -0.0706, 0.1397, -0.0332, 0.1512, 0.0053, 0.158, 0.0442, 0.1624, 0.0833, 0.1636, 0.1224, 0.1615, 0.1613, 0.1565, 0.1999, 0.15, 0.2378, 0.1402, 0.2749, 0.1279, 0.3118, 0.1147, 0.3487, 0.1015, 0.3858, 0.0892, 0.4236, 0.0787, 0.4621, 0.0715, 0.5012, 0.0702, 0.5398, 0.0766, 0.5768, 0.089, 0.6123, 0.1055, 0.6466, 0.1244, 0.6805, 0.144, 0.7147, 0.163, 0.75, 0.18], [-0.75, 0, -0.7033, 0.0195, -0.6569, 0.0399, -0.6104, 0.06, -0.5634, 0.0789, -0.5155, 0.0954, -0.4667, 0.1089, -0.4174, 0.1206, -0.3676, 0.1299, -0.3174, 0.1365, -0.2669, 0.1398, -0.2162, 0.1391, -0.1658, 0.1347, -0.1157, 0.1271, -0.0661, 0.1169, -0.017, 0.1046, 0.0316, 0.0903, 0.0791, 0.0728, 0.1259, 0.0534, 0.1723, 0.0331, 0.2188, 0.0129, 0.2656, -0.0064, 0.3122, -0.0263, 0.3586, -0.0466, 0.4052, -0.0665, 0.4525, -0.0847, 0.5007, -0.1002, 0.5497, -0.113, 0.5991, -0.124, 0.6491, -0.1325, 0.6994, -0.138, 0.75, -0.14]],
                b = [{
                start: 0.36,
                end: 0.11
            }, {
                start: 0.56,
                end: 0.16
            }];
            Skycons = function Skycons(e) {
                this.list = [], this.interval = null, this.color = e && e.color ? e.color : "black", this.resizeClear = !!e && !!e.resizeClear;
            }, Skycons.CLEAR_DAY = function (e, t, n) {
                var r = e.canvas.width,
                    s = e.canvas.height,
                    o = Math.min(r, s);
                h(e, t, r * .5, s * .5, o, o * i, n);
            }, Skycons.CLEAR_NIGHT = function (e, t, n) {
                var r = e.canvas.width,
                    s = e.canvas.height,
                    o = Math.min(r, s);
                p(e, t, r * .5, s * .5, o, o * i, n);
            }, Skycons.PARTLY_CLOUDY_DAY = function (e, t, n) {
                var r = e.canvas.width,
                    s = e.canvas.height,
                    o = Math.min(r, s);
                h(e, t, r * .625, s * .375, o * .75, o * i, n), c(e, t, r * .375, s * .625, o * .75, o * i, n);
            }, Skycons.PARTLY_CLOUDY_NIGHT = function (e, t, n) {
                var r = e.canvas.width,
                    s = e.canvas.height,
                    o = Math.min(r, s);
                p(e, t, r * .667, s * .375, o * .75, o * i, n), c(e, t, r * .375, s * .625, o * .75, o * i, n);
            }, Skycons.CLOUDY = function (e, t, n) {
                var r = e.canvas.width,
                    s = e.canvas.height,
                    o = Math.min(r, s);
                c(e, t, r * .5, s * .5, o, o * i, n);
            }, Skycons.RAIN = function (e, t, n) {
                var r = e.canvas.width,
                    s = e.canvas.height,
                    o = Math.min(r, s);
                d(e, t, r * .5, s * .37, o * .9, o * i, n), c(e, t, r * .5, s * .37, o * .9, o * i, n);
            }, Skycons.SLEET = function (e, t, n) {
                var r = e.canvas.width,
                    s = e.canvas.height,
                    o = Math.min(r, s);
                v(e, t, r * .5, s * .37, o * .9, o * i, n), c(e, t, r * .5, s * .37, o * .9, o * i, n);
            }, Skycons.SNOW = function (e, t, n) {
                var r = e.canvas.width,
                    s = e.canvas.height,
                    o = Math.min(r, s);
                m(e, t, r * .5, s * .37, o * .9, o * i, n), c(e, t, r * .5, s * .37, o * .9, o * i, n);
            }, Skycons.WIND = function (e, t, n) {
                var r = e.canvas.width,
                    s = e.canvas.height,
                    o = Math.min(r, s);
                E(e, t, r * .5, s * .5, o, o * i, 0, 2, n), E(e, t, r * .5, s * .5, o, o * i, 1, 2, n);
            }, Skycons.FOG = function (e, t, n) {
                var r = e.canvas.width,
                    o = e.canvas.height,
                    u = Math.min(r, o),
                    f = u * i;
                g(e, t, r * .5, o * .32, u * .75, f, n), t /= 5e3;
                var l = Math.cos(t * s) * u * .02,
                    c = Math.cos((t + .25) * s) * u * .02,
                    h = Math.cos((t + .5) * s) * u * .02,
                    p = Math.cos((t + .75) * s) * u * .02,
                    d = o * .936,
                    v = Math.floor(d - f * .5) + .5,
                    m = Math.floor(d - f * 2.5) + .5;
                e.strokeStyle = n, e.lineWidth = f, e.lineCap = "round", e.lineJoin = "round", a(e, l + r * .2 + f * .5, v, c + r * .8 - f * .5, v), a(e, h + r * .2 + f * .5, m, p + r * .8 - f * .5, m);
            }, Skycons.prototype = {
                add: function add(e, t) {
                    var n;
                    typeof e == "string" && (e = document.getElementById(e)), n = {
                        element: e,
                        context: e.getContext("2d"),
                        drawing: t
                    }, this.list.push(n), this.draw(n, r);
                },
                set: function set(e, t) {
                    var n;
                    typeof e == "string" && (e = document.getElementById(e));
                    for (n = this.list.length; n--;) {
                        if (this.list[n].element === e) {
                            this.list[n].drawing = t, this.draw(this.list[n], r);
                            return;
                        }
                    }this.add(e, t);
                },
                remove: function remove(e) {
                    var t;
                    typeof e == "string" && (e = document.getElementById(e));
                    for (t = this.list.length; t--;) {
                        if (this.list[t].element === e) {
                            this.list.splice(t, 1);
                            return;
                        }
                    }
                },
                draw: function draw(e, t) {
                    var n = e.context.canvas;
                    this.resizeClear ? n.width = n.width : e.context.clearRect(0, 0, n.width, n.height), e.drawing(e.context, t, this.color);
                },
                play: function play() {
                    var e = this;
                    this.pause(), this.interval = t(function () {
                        var t = Date.now(),
                            n;
                        for (n = e.list.length; n--;) {
                            e.draw(e.list[n], t);
                        }
                    }, 1e3 / 60);
                },
                pause: function pause() {
                    var e;
                    this.interval && (n(this.interval), this.interval = null);
                }
            };
        })(window);
        var StaticSkycons = function StaticSkycons() {
            var e = {};
            return e.play = e.pause = function () {}, e.set = function (e, t) {
                // var n = $("#" + e),
                //     r = $("<img />").attr("id", n.attr("id")).attr("class", n.attr("class")).attr("src", "skycons/" + t + ".gif").css({
                //         width: n.width(),
                //         height: n.height()
                //     });
            }, e;
        };
        StaticSkycons.RAIN = "rain";
        StaticSkycons.SNOW = "snow";
        StaticSkycons.SLEET = "sleet";
        StaticSkycons.WIND = "wind";
        StaticSkycons.FOG = "fog";
        StaticSkycons.CLOUDY = "cloudy";
        StaticSkycons.PARTLY_CLOUDY_DAY = "partly_cloudy_day";
        StaticSkycons.PARTLY_CLOUDY_NIGHT = "partly_cloudy_night";
        StaticSkycons.CLEAR_DAY = "clear_day";
        StaticSkycons.CLEAR_NIGHT = "clear_night";
        var ForecastEmbed = function ForecastEmbed(e) {
            var t = {},
                n,
                r,
                i,
                s = function s() {
                n = $('      <div id="forecast_embed" class="fe_container">                           <div class="fe_forecast">           <div class="fe_currently">             <canvas id="fe_current_icon" width="160" height="160" style="width:80px; height:80px"></canvas>             <div class="fe_temp"></div>             <div class="fe_summary"></div>             <div class="fe_wind"></div>           </div>                      <div class="fe_daily"></div>           <div style="clear:left"></div>         </div>                  <div class="fe_alert" style="display:none"></div>                  <div class="fe_loading" style="display:none">           <canvas id="fe_loading_icon" width="100" height="100" style="width:50px; height:50px"></canvas>           Loading...         </div>       </div>     '), t.elem = n, e.static_skycons && (window.Skycons = StaticSkycons), r = new Skycons({
                    color: e.text_color || "#333"
                }), e.static_skycons && (window.Skycons = StaticSkycons), r = new StaticSkycons({
                    color: e.text_color || "#333"
                }), i = new Skycons({
                    color: e.text_color || "#333"
                }), (n.find(".fe_title .fe_location span").html(e.title), n.find(".fe_title").show());
                if (e.ff_name && e.ff_url) {
                    var s = document.createElement("style");
                    s.type = "text/css", document.getElementsByTagName("head")[0].appendChild(s);
                    var o = "font-family: " + e.ff_name + "; src: url(" + e.ff_url + ");";
                    s.styleSheet ? s.styleSheet.cssText = "@font-face {" + o + "}" : s.innerHTML = "@font-face {" + o + "}";
                }(e.font || e.ff_name) && $("#widgetEmbed").css("font-family", e.font || e.ff_name), e.text_color && (n.css("color", e.text_color), n.find("a").css("color", e.text_color), n.find(".fe_title").css("border-color", e.text_color), n.find(".fe_alert a").css("color", e.text_color)), $(window).bind("resize", a), a();
            },
                o = function o(e) {
                var t = Math.round(e / 45);
                return ["N", "NE", "E", "SE", "S", "SW", "W", "NW", "N"][t];
            },
                u = function u(e) {
                return e === "rain" ? Skycons.RAIN : e === "snow" ? Skycons.SNOW : e === "sleet" ? Skycons.SLEET : e === "hail" ? Skycons.SLEET : e === "wind" ? Skycons.WIND : e === "fog" ? Skycons.FOG : e === "cloudy" ? Skycons.CLOUDY : e === "partly-cloudy-day" ? Skycons.PARTLY_CLOUDY_DAY : e === "partly-cloudy-night" ? Skycons.PARTLY_CLOUDY_NIGHT : e === "clear-day" ? Skycons.CLEAR_DAY : e === "clear-night" ? Skycons.CLEAR_NIGHT : Skycons.CLOUDY;
            },
                a = function a() {
                $("#widgetEmbed").width() < 400 ? ($("#widgetEmbed").addClass("hide_daily"), i.pause()) : ($("#widgetEmbed").removeClass("hide_daily"), i.play());
            },
                f = function f(t) {
                var r = new Date().getTime() / 1e3,
                    s = t.hourly.data,
                    a = t.currently.summary,
                    f = ForecastEmbed.unit_labels[e.units || "us"].speed;
                t.minutely && !t.minutely.summary.match(/ for the hour\.$/) && (a = t.minutely.summary);
                var l = 0;
                for (var c = 0; c < s.length; c++) {
                    if (s[c].time < r) continue;
                    l = s[c].temperature > t.currently.temperature ? 1 : -1;
                    break;
                }
                var h = Math.round(t.currently.temperature) + "&deg;";
                l > 0 ? h += ' <span class="fe_dir">and rising</span>' : l < 0 && (h += ' <span class="fe_dir">and falling</span>'), n.find(".fe_currently .fe_temp").html(h), n.find(".fe_currently .fe_summary").html(a);
                if (t.currently.windSpeed) {
                    var p = Math.round(t.currently.windSpeed);
                    p != 0 && t.currently.windBearing ? p += " " + f + " (" + o(t.currently.windBearing) + ")" : p += " " + f, n.find(".fe_currently .fe_wind").html("Wind: " + p);
                }
                i.set("fe_current_icon", u(t.currently.icon));
            },
                l = function l(t) {
                var $daily_container = n.find(".fe_daily").empty();
                var r = $('<div class="fe_day">           <span class="fe_label">MON</span>           <canvas class="fe_icon" width="52" height="52" style="width:26px; height:26px" />           <div class="fe_temp_bar">             <span class="fe_high_temp">72&deg;</span>             <span class="fe_low_temp">50&deg;</span>           </div>         </div>'),
                    s = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                    o = new Date().getDay(),
                    a = t.daily.data,
                    f = Math.max(6, a.length),
                    l,
                    c,
                    h = -Infinity,
                    p = Infinity;
                for (var d = 0; d < f; d++) {
                    l = a[d], l.temperatureMax > h && (h = l.temperatureMax), l.temperatureMin < p && (p = l.temperatureMin);
                }var v = 82,
                    m = h - p,
                    g,
                    y;
                for (var d = 0; d < f; d++) {
                    (function (t, $daily_container) {
                        c = r.clone(), l = a[t], g = v * (l.temperatureMax - l.temperatureMin) / m, y = v * (h - l.temperatureMax) / m, c.find(".fe_label").html(t == 0 ? "Today" : s[(o + t) % 7]), c.find(".fe_high_temp").html(Math.round(l.temperatureMax) + "&deg;"), c.find(".fe_low_temp").html(Math.round(l.temperatureMin) + "&deg;"), c.find(".fe_temp_bar").css({
                            height: g,
                            top: y,
                            "background-color": e.color || "#333"
                        }), typeof FlashCanvas != "undefined" && FlashCanvas.initElement(c.find("canvas")[0]), c.find(".fe_icon").attr("id", "fe_day_icon" + t), setTimeout(function () {
                            i.set("fe_day_icon" + t, u(a[t].icon));
                        }, 0), c.appendTo($daily_container);
                    })(d, $daily_container);
                }
            },
                c = function c(e) {
                var $alert = n.find(".fe_alert").empty();
                if (!e.alerts || !e.alerts.length) {
                    $alert.hide();
                    return;
                }

                var t = e.alerts[0];
                $('<a target="_blank"></a>').html('<span class="fe_icon">&#9873;</span> ' + t.title).attr("href", t.uri).appendTo($alert), $alert.show();
            };

            return t.loading = function (e) {
                e ? (r.set("fe_loading_icon", Skycons.PARTLY_CLOUDY_DAY), r.play(), n.find(".fe_loading").show()) : (n.find(".fe_loading").hide(), r.pause());
            }, t.build = function (forecastData) {
                // n.find(".fe_title .fe_forecast_link a").attr("href", "http://forecast.io/#/f/" + forecastData.latitude + "," + forecastData.longitude)
                f(forecastData);
                l(forecastData);
                c(forecastData);
                $("#widgetEmbed").hasClass("hide_daily") || i.play();
            }, s(), t;
        };
        ForecastEmbed.unit_labels = {
            us: {
                speed: "mph"
            },
            si: {
                speed: "m/s"
            },
            ca: {
                speed: "km/h"
            },
            uk: {
                speed: "mph"
            }
        };

        function generateWidget(opts) {
            service.embed = new ForecastEmbed(opts);
            service.embed.elem.prependTo($('#widgetEmbed'));
            service.embed.loading(true);
        }

        function setForecast(forecast) {
            setTimeout(function () {
                console.log('setting forecast');
                service.embed.build(forecast);
                service.embed.loading(false);
            }, 250);
        }

        return service;
    }

    /* jshint ignore:end */
})();
'use strict';

(function () {
    angular.module('skyApp.weather').controller('WeatherGraphController', ['$scope', '$timeout', 'GraphService', 'WidgetService', '$q', 'WeatherService', '$window', WeatherGraphController]);

    function WeatherGraphController($scope, $timeout, GraphService, WidgetService, $q, WeatherService, $window) {
        var mcEl = document.getElementById('monthly-move-chart');
        var vcEl = document.getElementById('monthly-volume-chart');
        var lcEl = document.getElementById('location-chart');
        var fcEl = document.getElementById('fluctuation-chart');

        var GG = this;
        // $scope.$watch('items',function(newValue,oldValue) {
        //     console.log(newValue,oldValue);
        // });
        angular.extend($scope, {

            dashboard: {},

            gridsterOptions: {
                swapping: true,
                margins: [20, 20],
                columns: 6,
                mobileModeEnabled: false,
                draggable: {
                    enabled: true
                },
                // handle: 'h3'
                resizable: {
                    enabled: false,
                    // enabled: false,
                    handles: ['n', 'e', 's', 'w', 'ne', 'se', 'sw', 'nw'],
                    // optional callback fired when resize is started
                    start: function start(event, $element, widget) {},

                    // optional callback fired when item is resized,
                    resize: function resize(event, $element, widget) {
                        if (widget.chart.api) widget.chart.api.update();
                    },

                    stop: function stop(event, $element, widget) {
                        console.log(event, $element, widget);
                        $timeout(function () {
                            console.log('stopped');
                            widget.chart.api.update();
                        }, 400);
                    }
                }
            },

            config: {
                visible: false
            },

            events: {
                resize: function resize(e, scope) {
                    $timeout(function () {
                        if (scope.api && scope.api.update) scope.api.update();
                    }, 200);
                }
            }

        });

        WeatherService.getGraphData(getConfig()).then(function (graphData) {
            return GraphService.createGraphs(graphData);
        }).then(function (graphs) {
            return WidgetService.createWidgets(graphs);
        }).then(function (widgets) {
            console.log(widgets);
            $scope.dashboard.widgets = widgets;

            $timeout(function () {
                $scope.config.visible = true;
                startCrossFilters();
            }, 1000);
        });

        // angular.element($window).on('resize', function(e){
        //     $scope.$broadcast('resize');
        // });

        // We want to hide the charts until the grid will be created and all widths and heights will be defined.
        // So that use `visible` property in config attribute

        function updateSize(_ref) {
            var chart = _ref.c;
            var el = _ref.e;
            var h = _ref.hFn;
            var w = _ref.wFn;

            chart.width(w(el.offsetWidth)).height(h(el.offsetHeight)).transitionDuration(0);
        }

        /////////
        // d3.json('static/json/california.geojson', california => {
        function startCrossFilters() {
            WeatherService.getHistorical().then(function (d) {
                return $q(function (resolve, reject) {
                    $q.when(d).then(resolve, reject);
                });
            }).then(function (data) {
                var _nameDimension$group, _dateDimension$group;

                var gddTracker = document.getElementById('gddTracker');
                // var moveChart = dc.compositeChart('#monthly-move-chart'),
                var moveChart = dc.lineChart('#monthly-move-chart'),
                    moveWidth = mcEl.offsetWidth,
                    moveHeight = mcEl.offsetHeight;

                var volumeChart = dc.barChart('#monthly-volume-chart'),
                    volumeWidth = vcEl.offsetWidth,
                    volumeHeight = vcEl.offsetHeight;

                var locationChart = dc.bubbleChart("#location-chart"),
                    locationWidth = lcEl.offsetWidth,
                    locationHeight = lcEl.offsetHeight;

                var fluctuationChart = dc.barChart('#fluctuation-chart'),
                    fluctuationHeight = fcEl.offsetHeight,
                    fluctuationWidth = fcEl.offsetWidth;

                var charts = [{
                    c: moveChart,
                    e: gddTracker,
                    hFn: function hFn(h) {
                        return 0.8 * h;
                    },
                    wFn: function wFn(w) {
                        return w;
                    }
                }, {
                    c: volumeChart,
                    e: gddTracker,
                    hFn: function hFn(h) {
                        return 0.15 * h;
                    },
                    wFn: function wFn(w) {
                        return w;
                    }
                }, {
                    c: locationChart,
                    e: lcEl,
                    hFn: function hFn(h) {
                        return h;
                    },
                    wFn: function wFn(w) {
                        return w;
                    }
                }, {
                    c: fluctuationChart,
                    e: fcEl,
                    hFn: function hFn(h) {
                        return h;
                    },
                    wFn: function wFn(w) {
                        return w;
                    }
                }];

                angular.element($window).on('resize', function (e) {
                    charts.map(updateSize);
                    dc.renderAll();
                    // dc.events.trigger(dc.renderAll, 20);
                    charts.map(function (_ref2) {
                        var chart = _ref2.c;
                        return chart.transitionDuration(750);
                    });
                });

                var numericProperties = ['tmin', 'gdd', 'precipAccum', 'windSpeed', 'cloudCover', 'windBearing', 'tmax', 'humidity', 'lat', 'lng'];
                var dateFormat = d3.time.format('%m/%d/%Y');
                var numberFormat = d3.format('.2f');

                angular.forEach(data, function (d) {
                    d.year = d3.time.year(d.date).getFullYear();
                    d.month = d3.time.month(d.date);

                    numericProperties.forEach(function (p) {
                        d[p] = angular.isNumber(d[p]) ? parseFloat(d[p]) : null;
                    });
                });

                // var endDate = d3.max(_data, d => d.date );
                // var oneYearPrior = new Date(endDate.getUTCMilliseconds() - 365*24*3600*1000);

                // var data = _data.filter( v => v.date >= oneYearPrior );

                var ndx = crossfilter(data);
                var all = ndx.groupAll();

                var nameDimension = ndx.dimension(function (d) {
                    return d.name;
                });
                var latDimension = ndx.dimension(function (d) {
                    return d.lat;
                }),
                    latDomain = latDimension.bottom(1).concat(latDimension.top(1)).map(function (c) {
                    return c.lat;
                });
                var lngDimension = ndx.dimension(function (d) {
                    return d.lng;
                }),
                    lngDomain = lngDimension.bottom(1).concat(lngDimension.top(1)).map(function (c) {
                    return c.lng;
                });

                // console.log(latDomain,lngDomain);

                var locationDimension = ndx.dimension(function (d) {
                    return [d.lng, d.lat];
                });
                var locationGroup = locationDimension.group();
                console.log(locationDimension);

                var dateDimension = ndx.dimension(function (d) {
                    return d.date;
                });
                var monthlyDimension = ndx.dimension(function (d) {
                    return d.month;
                });
                var yearlyDimension = ndx.dimension(function (d) {
                    return d.year;
                });

                var dateExtent = d3.extent(data.map(function (d) {
                    return d.date;
                }));
                var dateDomain = dateExtent.map(function (d) {
                    return new Date(d);
                });

                var dailyGDDMove = dateDimension.group().reduceSum(function (d) {
                    return d.gdd;
                });
                var dailyPrecipMove = dateDimension.group().reduceSum(function (d) {
                    return d.precipAccum;
                });

                var monthlyGDDMove = monthlyDimension.group().reduceSum(function (d) {
                    return d.gdd;
                });
                var monthlyPrecipMove = monthlyDimension.group().reduceSum(function (d) {
                    return d.precipAccum;
                });

                var tempAvgByDayGroup = dateDimension.group().reduce(reduceAddAvgWithMean('tmax', 'tmin'), reduceRemoveAvgWithMean('tmax', 'tmin'), reduceInitAvg);
                var gddAvgByMonthGroup = dateDimension.group().reduce(reduceAddAvg('gdd'), reduceRemoveAvg('gdd'), reduceInitAvg);

                var reducers = [function (p, v) {
                    ++p.count;
                    p.lat = v.lat;
                    p.lng = v.lng;
                    p.name = v.name;
                    p.absGain = v.gdd;
                    p.sumGdd += v.gdd;
                    p.avgGdd = p.sumGdd / p.count;
                    p.percentageGain = p.avgGdd ? p.absGain / p.avgGdd * 100 : 0;
                    return p;
                },
                /* callback for when data is removed from the current filter results */
                function (p, v) {
                    --p.count;
                    p.lat = v.lat;
                    p.lng = v.lng;
                    p.name = v.name;
                    p.absGain = v.gdd;
                    p.sumGdd -= v.gdd;
                    p.avgGdd = p.count ? p.sumGdd / p.count : 0;
                    p.percentageGain = p.avgGdd ? p.absGain / p.avgGdd * 100 : 0;
                    return p;
                },
                /* initialize p */
                function () {
                    return {
                        count: 0,
                        lat: 0,
                        lng: 0,
                        name: '',
                        absGain: 0,
                        sumGdd: 0,
                        avgGdd: 0,
                        percentageGain: 0
                    };
                }];

                // wait for window resizes
                // angular.element($window).on('resize', $scope.$apply.bind($scope));

                // $scope.$watch(function() {
                //     return el.clientWidth * el.clientHeight
                // }, function() {
                //     width = el.clientWidth;
                //     height = el.clientHeight;
                //     resize();
                // });

                var locationGDDGroup = (_nameDimension$group = nameDimension.group()).reduce.apply(_nameDimension$group, reducers);
                var yearlyGDDSumGroup = nameDimension.group().reduceSum(function (d) {
                    return d.gdd;
                });
                var yearlyGDDSumDomain = d3.extent(yearlyGDDSumGroup.top(1).push(yearlyGDDSumGroup.all().reverse()[0], function (dd) {
                    return dd.value;
                }));

                console.log(locationGDDGroup.all());
                console.log(yearlyGDDSumGroup.all());
                // var [latDomain,lngDomain] = [0,1].map(indx => d3.extent(california.geometry.coordinates, c => c[indx]));
                // console.log(latDomain,lngDomain)
                locationChart.width(locationWidth).height(locationHeight).transitionDuration(1000).margins({ top: 80, right: 50, bottom: 25, left: 50 }).dimension(nameDimension).group(locationGDDGroup).x(d3.scale.linear().domain(lngDomain)).y(d3.scale.linear().domain(latDomain))
                // .r(d3.scale.linear().domain([3700,6400]))
                .elasticRadius(true)
                // .minRadius(1)
                // .colors(colorbrewer.RdYlGn[9])
                // .colorDomain(d3.scale.linear().domain([3700,4400]))
                // .colorAccessor( p => p.value.sumGdd )
                .keyAccessor(function (p) {
                    return p.value.lng;
                }).valueAccessor(function (p) {
                    return p.value.lat;
                }).radiusValueAccessor(function (p) {
                    return p.value.sumGdd;
                }).maxBubbleRelativeSize(0.1).xAxisPadding(0.1).yAxisPadding(0.1).elasticX(true).elasticY(true).xAxisLabel('Latitude').yAxisLabel('Longitude').renderLabel(true).label(function (p) {
                    return p.key;
                }).renderTitle(true).title(function (p) {
                    return [p.key, 'Index Gain: ' + numberFormat(p.value.absGain), 'Index Gain in Percentage: ' + numberFormat(p.value.percentageGain) + '%', 'Fluctuation / Index Ratio: ' + numberFormat(p.value.fluctuationPercentage) + '%'].join('\n');
                });
                // .legend(dc.legend().x(400).y(10).itemHeight(13).gap(5))
                //
                // .clipPadding(10)
                // .excludedOpacity(0.5)

                // locationChart.overlayGeoJson(california);

                var dailyGDDGroup = (_dateDimension$group = dateDimension.group()).reduce.apply(_dateDimension$group, reducers);

                moveChart.x(d3.time.scale().domain(dateDomain)).width(moveWidth).height(moveHeight * 0.8)
                // .compose([
                // dc.lineChart(moveChart)
                .renderArea(true).transitionDuration(1000).margins({ top: 30, right: 50, bottom: 25, left: 50 }).dimension(dateDimension).mouseZoomable(true).rangeChart(volumeChart).round(d3.time.day.round).xUnits(d3.time.days).elasticY(true).renderHorizontalGridLines(true).legend(dc.legend().x(80).y(40).itemHeight(13).gap(5)).brushOn(false).group(dailyGDDGroup, 'Accumulated GDD (past year)').valueAccessor(function (d) {
                    return d.value.sumGdd;
                }).stack(dailyGDDGroup, 'Daily GDD', function (d) {
                    return d.value.absGain;
                }).title(function (d) {
                    var value = d.value.avg ? d.value.avg : d.value;
                    if (isNaN(value)) {
                        value = 0;
                    }
                    return dateFormat(d.key) + '\n' + numberFormat(value);
                });
                //,
                //     dc.lineChart(moveChart)
                //         .group(dailyGDDGroup, 'Average Daily GDD', d => d.value.avgGdd)
                //         .elasticY(true)
                // ]);

                volumeChart.width(volumeWidth).height(moveHeight * 0.15).margins({ top: 0, right: 50, bottom: 20, left: 50 }).dimension(dateDimension).group(tempAvgByDayGroup).valueAccessor(function (d) {
                    return d.value.avg;
                }).centerBar(true).gap(1).x(d3.time.scale().domain(dateDomain)).round(d3.time.day.round).alwaysUseRounding(true).xUnits(d3.time.days).yAxis().ticks(0);

                var fluctuation = ndx.dimension(function (d) {
                    return Math.round(d.tmax - d.tmin);
                });
                var fluctuationGroup = fluctuation.group();

                fluctuationChart.width(fluctuationWidth).height(fluctuationHeight).margins({ top: 60, right: 50, bottom: 30, left: 50 }).dimension(fluctuation).group(fluctuationGroup).elasticY(true).centerBar(true).gap(1).round(dc.round.floor).alwaysUseRounding(true).x(d3.scale.linear().domain([0, 30])).renderHorizontalGridLines(true).filterPrinter(function (filters) {
                    var filter = filters[0],
                        s = '';
                    s += numberFormat(filter[0]) + '% -> ' + numberFormat(filter[1]) + '%';
                    return s;
                });

                fluctuationChart.xAxis().tickFormat(function (v) {
                    return v + 'F';
                });
                fluctuationChart.yAxis().ticks(5);

                dc.renderAll();
            });
            function reduceAddAvg(attr) {
                return function (p, v) {
                    ++p.count;
                    p.total += v[attr];
                    p.avg = p.total / p.count;
                    return p;
                };
            }

            function reduceRemoveAvg(attr) {
                return function (p, v) {
                    --p.count;
                    p.total -= v[attr];
                    p.avg = p.total / p.count;
                    return p;
                };
            }

            function reduceAddAvgWithMean(prop1, prop2) {
                return function (p, v) {
                    ++p.count;
                    p.total += (v[prop1] + v[prop2]) / 2;
                    p.avg = Math.round(p.total / p.count);
                    return p;
                };
            }

            function reduceRemoveAvgWithMean(prop1, prop2) {
                return function (p, v) {
                    --p.count;
                    p.total -= (v[prop1] + v[prop2]) / 2;
                    p.avg = p.count ? Math.round(p.total / p.count) : 0;
                    return p;
                };
            }

            function reduceInitAvg() {
                return { count: 0, total: 0, avg: 0 };
            }
        }

        /////////

        function getConfig() {
            return [{
                xConfig: {
                    param: 'time',
                    unit: 'DAY',
                    label: 'Day',
                    axisStyle: 'absolute'
                },
                yConfig: {
                    unitFmt: '2.0f',
                    unit: 'F',
                    axisLabel: 'Temperature (F)',
                    axisStyle: [0, 120], //'absolute',
                    yParams: [{
                        param: 'temperatureMax',
                        key: 'Max. Temp.',
                        // color:'#ff7f0e',
                        area: false
                    }, {
                        param: 'temperatureMin',
                        key: 'Min. Temp.',
                        // color:'#7777ff',
                        area: false
                    }]
                },
                title: 'Actual Temperatures',
                location: { lat: 38.431175, lng: -122.3476730 }
            },
            // {
            //     xConfig: {
            //         param: 'time',
            //         unit: 'DAY',
            //         label: 'Days',
            //         axisStyle:'absolute' // [min, max]
            //     },
            //     yConfig:  {
            //         yParams: [{
            //             param: 'precipProbability',
            //             key: 'Chance of Rain',
            //             // color:'#ff7f0e',
            //             area:false
            //         }],
            //         unitFmt: '.0f',
            //         unit: '%',
            //         axisLabel: 'Chance of Rain (%)',
            //         axisStyle: [0,100]
            //     },
            //     title: 'Chance of Rain',
            //     location: {lat:38.431175,lng: -122.3476730}
            // },
            {
                xConfig: {
                    param: 'time',
                    unit: 'DAY',
                    label: 'Days',
                    axisStyle: 'absolute' // [min, max]
                },
                yConfig: {
                    yParams: [{
                        param: 'humidity',
                        key: 'Humidity',
                        // color:'#ff7f0e',
                        area: false
                    }, {
                        param: 'cloudCover',
                        key: 'Cloud Cover',
                        // color:'#ff7f0e',
                        area: false
                    }],
                    unitFmt: '.2f',
                    unit: '',
                    axisLabel: '',
                    axisStyle: [0, 1]
                },

                title: 'Humidity & Cloud Cover',
                location: { lat: 38.431175, lng: -122.3476730 }
            }];
        }
    };
})();
'use strict';

(function () {
    angular.module('skyApp.weather').config(['$stateProvider', '$urlRouterProvider', configureStates]);

    function configureStates($stateProvider, $urlRouterProvider) {

        $stateProvider.state("home.weather", {
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
                    controller: 'WeatherController'
                }
            },
            data: {
                uploaderTarget: 'nav-uploader',
                sliderOpen: true,
                contentWidth: 100
            }
        }).state("home.weather.detail", {
            url: '/{detail}',
            parent: "home.weather",
            // templateUrl: 'templates/weather/weather-view.html',
            controller: ['$scope', '$stateParams', function ($scope, $stateParams) {
                console.log($stateParams.detail);
                $scope.$parent.setOperation($stateParams.detail);
            }]
        });
    };
})();
'use strict';

(function () {
    angular.module('skyApp.weather').directive('weatherSeries', WeatherSeries);

    WeatherSeries.$inject = ['WeatherService', 'ForecastService'];
    function WeatherSeries(WeatherService, ForecastService) {
        WeatherSeriesController.$inject = ['$scope', '$element', '$attrs'];

        return {
            restrict: 'E',
            scope: {
                forecast: '='
            },
            link: WeatherSeriesController
        };

        function WeatherSeriesController(scope, element, attrs) {
            var wsc = this;

            // scope.$watch('forecast',function(forecast){

            // })
        }
    }
})();
'use strict';

angular.module('skyApp').run(['$templateCache', function ($templateCache) {
  $templateCache.put('upload-inset.view.html', '<div class="uploaderContainer">\n<!-- <button ng-click="$ctrl.move()">Move</button> \n --><style type="text/css">\n.dz-message {\n  display: block !important;\n}\n</style>\n<script>\n$(\'.dropzoneSmallContainer\').removeClass(\'hidden\');\n$(\'.close\').click(function(){\n\t$(\'.dropzoneSmallContainer\').html(\'\').addClass(\'hidden\');\n});\n</script>\n\t<div class="uploaderHeader">\n\t\t<span class="pull-right close" alt="close" title="close">\n        \t<svg x="0px" y="0px" width="14px" height="14px" viewBox="0 0 10 10" focusable="false"><polygon fill="#fff" points="10,1.01 8.99,0 5,3.99 1.01,0 0,1.01 3.99,5 0,8.99 1.01,10 5,6.01 8.99,10 10,8.99 6.01,5 "></polygon></svg>\n        </span>\n\t\t<span class="pull-right close" alt="close" title="close">\n        \t<svg x="0px" y="0px" width="14px" height="14px" viewBox="0 0 24 24" focusable="false"><path fill="#fff" d="M21.17,5.17L12,14.34l-9.17-9.17L0,8l12,12,12-12z"></path></svg>\n\t\t</span>        \t\n\t</div>\n\t<div class="dropzone dz-message">\n\t    <form id="{{$ctrl.uploaderId || \'uploader\'}}">\n\t        <input type="button" id="uploadBtn" name="uploadBtn" class="hidden pull-left" value="upload">\n\t        <input type="button" id="deleteAllBtn" name="deleteAllBtn" class="hidden pull-left" value="Delete all">\n\t        <input type="button" class="dz-message dz-browse" id="browseBtn" name="browseBtn" value="Browse...">\n\t        <span>&nbsp;</span>\n\t    </form>\n\t</div>\t    \n</div>');
  $templateCache.put('upload-view.html', '<div>\n\n<div sky-uploader></div>\n\n</div>');
  $templateCache.put('upload.preview.html', '<div class="dz-preview dz-file-preview preview-container">\n    <div class="dz-image"><img data-dz-thumbnail /></div>\n    <div class="dz-details">\n        <div class="dz-filename"><span data-dz-name></span></div>\n        <div class="dz-size"><span data-dz-size></span></div>\n    </div>\n    <div class="dz-details">\n        <div class="dz-size"><span data-dz-size></span></div>\n    </div>\n    <div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div>\n    <div class="upload-icons">\n        <div class="dz-error-message"><span data-dz-errormessage></span></div>\n        <div class="dz-success-mark">\n            <svg width="54px" height="54px" viewBox="0 0 54 54" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns">\n                <title>Check</title>\n                <defs></defs>\n                <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">\n                    <path d="M23.5,31.8431458 L17.5852419,25.9283877 C16.0248253,24.3679711 13.4910294,24.366835 11.9289322,25.9289322 C10.3700136,27.4878508 10.3665912,30.0234455 11.9283877,31.5852419 L20.4147581,40.0716123 C20.5133999,40.1702541 20.6159315,40.2626649 20.7218615,40.3488435 C22.2835669,41.8725651 24.794234,41.8626202 26.3461564,40.3106978 L43.3106978,23.3461564 C44.8771021,21.7797521 44.8758057,19.2483887 43.3137085,17.6862915 C41.7547899,16.1273729 39.2176035,16.1255422 37.6538436,17.6893022 L23.5,31.8431458 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z" id="Oval-2" stroke-opacity="0.198794158" stroke="#747474" fill-opacity="0.816519475" fill="#0F9D58" sketch:type="MSShapeGroup"></path>\n                </g>\n            </svg>\n        </div>\n        <div class="dz-error-mark">\n            <svg width="54px" height="54px" viewBox="0 0 54 54" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns">\n                <title>Error</title>\n                <defs></defs>\n                <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">\n                    <g id="Check-+-Oval-2" sketch:type="MSLayerGroup" stroke="#747474" stroke-opacity="0.198794158" fill="#e50000" fill-opacity="0.816519475">\n                        <path d="M32.6568542,29 L38.3106978,23.3461564 C39.8771021,21.7797521 39.8758057,19.2483887 38.3137085,17.6862915 C36.7547899,16.1273729 34.2176035,16.1255422 32.6538436,17.6893022 L27,23.3431458 L21.3461564,17.6893022 C19.7823965,16.1255422 17.2452101,16.1273729 15.6862915,17.6862915 C14.1241943,19.2483887 14.1228979,21.7797521 15.6893022,23.3461564 L21.3431458,29 L15.6893022,34.6538436 C14.1228979,36.2202479 14.1241943,38.7516113 15.6862915,40.3137085 C17.2452101,41.8726271 19.7823965,41.8744578 21.3461564,40.3106978 L27,34.6568542 L32.6538436,40.3106978 C34.2176035,41.8744578 36.7547899,41.8726271 38.3137085,40.3137085 C39.8758057,38.7516113 39.8771021,36.2202479 38.3106978,34.6538436 L32.6568542,29 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z" id="Oval-2" sketch:type="MSShapeGroup"></path>\n                    </g>\n                </g>\n            </svg>\n        </div>\n    </div>\n</div>\n');
  $templateCache.put('upload.removefile.svg', '<div class="dz-preview dz-file-preview preview-container">\n    <div class="dz-image"><img data-dz-thumbnail /></div>\n    <div class="dz-details">\n        <div class="dz-filename"><span data-dz-name></span></div>\n        <div class="dz-size"><span data-dz-size></span></div>\n    </div>\n    <div class="dz-details">\n        <div class="dz-size"><span data-dz-size></span></div>\n    </div>\n    <div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div>\n    <div class="upload-icons">\n        <div class="dz-error-message"><span data-dz-errormessage></span></div>\n        <div class="dz-success-mark">\n            <svg width="54px" height="54px" viewBox="0 0 54 54" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns">\n                <title>Check</title>\n                <defs></defs>\n                <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">\n                    <path d="M23.5,31.8431458 L17.5852419,25.9283877 C16.0248253,24.3679711 13.4910294,24.366835 11.9289322,25.9289322 C10.3700136,27.4878508 10.3665912,30.0234455 11.9283877,31.5852419 L20.4147581,40.0716123 C20.5133999,40.1702541 20.6159315,40.2626649 20.7218615,40.3488435 C22.2835669,41.8725651 24.794234,41.8626202 26.3461564,40.3106978 L43.3106978,23.3461564 C44.8771021,21.7797521 44.8758057,19.2483887 43.3137085,17.6862915 C41.7547899,16.1273729 39.2176035,16.1255422 37.6538436,17.6893022 L23.5,31.8431458 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z" id="Oval-2" stroke-opacity="0.198794158" stroke="#747474" fill-opacity="0.816519475" fill="#0F9D58" sketch:type="MSShapeGroup"></path>\n                </g>\n            </svg>\n        </div>\n        <div class="dz-error-mark">\n            <svg width="54px" height="54px" viewBox="0 0 54 54" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns">\n                <title>Error</title>\n                <defs></defs>\n                <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">\n                    <g id="Check-+-Oval-2" sketch:type="MSLayerGroup" stroke="#747474" stroke-opacity="0.198794158" fill="#e50000" fill-opacity="0.816519475">\n                        <path d="M32.6568542,29 L38.3106978,23.3461564 C39.8771021,21.7797521 39.8758057,19.2483887 38.3137085,17.6862915 C36.7547899,16.1273729 34.2176035,16.1255422 32.6538436,17.6893022 L27,23.3431458 L21.3461564,17.6893022 C19.7823965,16.1255422 17.2452101,16.1273729 15.6862915,17.6862915 C14.1241943,19.2483887 14.1228979,21.7797521 15.6893022,23.3461564 L21.3431458,29 L15.6893022,34.6538436 C14.1228979,36.2202479 14.1241943,38.7516113 15.6862915,40.3137085 C17.2452101,41.8726271 19.7823965,41.8744578 21.3461564,40.3106978 L27,34.6568542 L32.6538436,40.3106978 C34.2176035,41.8744578 36.7547899,41.8726271 38.3137085,40.3137085 C39.8758057,38.7516113 39.8771021,36.2202479 38.3106978,34.6538436 L32.6568542,29 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z" id="Oval-2" sketch:type="MSShapeGroup"></path>\n                    </g>\n                </g>\n            </svg>\n        </div>\n    </div>\n</div>\n');
}]);
'use strict';

angular.module('skyApp').run(['$templateCache', function ($templateCache) {
  $templateCache.put('flights/flight-display.partial.html', '<td ng-repeat="col in $columns track by $index">\n    <div class="col-md-12">\n        <div class="col-md-8">\n            <div class="line-height" ng-repeat="displayField in col.displaygroup.stats">\n                <flight-stats></flight-stats>\n            </div>\n        </div>\n        <div class="col-md-4">\n            <div class="line-height" ng-repeat="link in col.displaygroup.links">\n                <flight-downloads></flight-downloads>\n            </div>\n        </div>\n    </div>\n    <div ng-if="$last">\n        <img ng-src="{{::flight.previewUrl}}"/>\n    </div>\n</td>\n');
}]);
'use strict';

angular.module('skyApp').run(['$templateCache', function ($templateCache) {
  $templateCache.put('upload-inset.view.html', '<div class="uploaderContainer">\n<!-- <button ng-click="$ctrl.move()">Move</button> \n --><style type="text/css">\n.dz-message {\n  display: block !important;\n}\n</style>\n<script>\n$(\'.dropzoneSmallContainer\').removeClass(\'hidden\');\n$(\'.close\').click(function(){\n\t$(\'.dropzoneSmallContainer\').html(\'\').addClass(\'hidden\');\n});\n</script>\n\t<div class="uploaderHeader">\n\t\t<span class="pull-right close" alt="close" title="close">\n        \t<svg x="0px" y="0px" width="14px" height="14px" viewBox="0 0 10 10" focusable="false"><polygon fill="#fff" points="10,1.01 8.99,0 5,3.99 1.01,0 0,1.01 3.99,5 0,8.99 1.01,10 5,6.01 8.99,10 10,8.99 6.01,5 "></polygon></svg>\n        </span>\n\t\t<span class="pull-right close" alt="close" title="close">\n        \t<svg x="0px" y="0px" width="14px" height="14px" viewBox="0 0 24 24" focusable="false"><path fill="#fff" d="M21.17,5.17L12,14.34l-9.17-9.17L0,8l12,12,12-12z"></path></svg>\n\t\t</span>        \t\n\t</div>\n\t<div class="dropzone dz-message">\n\t    <form id="{{$ctrl.uploaderId || \'uploader\'}}">\n\t        <input type="button" id="uploadBtn" name="uploadBtn" class="hidden pull-left" value="upload">\n\t        <input type="button" id="deleteAllBtn" name="deleteAllBtn" class="hidden pull-left" value="Delete all">\n\t        <input type="button" class="dz-message dz-browse" id="browseBtn" name="browseBtn" value="Browse...">\n\t        <span>&nbsp;</span>\n\t    </form>\n\t</div>\t    \n</div>');
  $templateCache.put('upload-view.html', '<div>\n\n<div sky-uploader></div>\n\n</div>');
  $templateCache.put('upload.preview.html', '<div class="dz-preview dz-file-preview preview-container">\n    <div class="dz-image"><img data-dz-thumbnail /></div>\n    <div class="dz-details">\n        <div class="dz-filename"><span data-dz-name></span></div>\n        <div class="dz-size"><span data-dz-size></span></div>\n    </div>\n<!--     <div class="dz-details">\n        <div class="dz-size"><span data-dz-size></span></div>\n    </div> -->\n    <div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div>\n    <div class="upload-icons">\n        <div class="dz-error-message"><span data-dz-errormessage></span></div>\n        <div class="dz-success-mark">\n            <svg width="54px" height="54px" viewBox="0 0 54 54" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns">\n                <title>Check</title>\n                <defs></defs>\n                <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">\n                    <path d="M23.5,31.8431458 L17.5852419,25.9283877 C16.0248253,24.3679711 13.4910294,24.366835 11.9289322,25.9289322 C10.3700136,27.4878508 10.3665912,30.0234455 11.9283877,31.5852419 L20.4147581,40.0716123 C20.5133999,40.1702541 20.6159315,40.2626649 20.7218615,40.3488435 C22.2835669,41.8725651 24.794234,41.8626202 26.3461564,40.3106978 L43.3106978,23.3461564 C44.8771021,21.7797521 44.8758057,19.2483887 43.3137085,17.6862915 C41.7547899,16.1273729 39.2176035,16.1255422 37.6538436,17.6893022 L23.5,31.8431458 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z" id="Oval-2" stroke-opacity="0.198794158" stroke="#747474" fill-opacity="0.816519475" fill="#0F9D58" sketch:type="MSShapeGroup"></path>\n                </g>\n            </svg>\n        </div>\n        <div class="dz-error-mark">\n            <svg width="54px" height="54px" viewBox="0 0 54 54" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns">\n                <title>Error</title>\n                <defs></defs>\n                <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">\n                    <g id="Check-+-Oval-2" sketch:type="MSLayerGroup" stroke="#747474" stroke-opacity="0.198794158" fill="#e50000" fill-opacity="0.816519475">\n                        <path d="M32.6568542,29 L38.3106978,23.3461564 C39.8771021,21.7797521 39.8758057,19.2483887 38.3137085,17.6862915 C36.7547899,16.1273729 34.2176035,16.1255422 32.6538436,17.6893022 L27,23.3431458 L21.3461564,17.6893022 C19.7823965,16.1255422 17.2452101,16.1273729 15.6862915,17.6862915 C14.1241943,19.2483887 14.1228979,21.7797521 15.6893022,23.3461564 L21.3431458,29 L15.6893022,34.6538436 C14.1228979,36.2202479 14.1241943,38.7516113 15.6862915,40.3137085 C17.2452101,41.8726271 19.7823965,41.8744578 21.3461564,40.3106978 L27,34.6568542 L32.6538436,40.3106978 C34.2176035,41.8744578 36.7547899,41.8726271 38.3137085,40.3137085 C39.8758057,38.7516113 39.8771021,36.2202479 38.3106978,34.6538436 L32.6568542,29 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z" id="Oval-2" sketch:type="MSShapeGroup"></path>\n                    </g>\n                </g>\n            </svg>\n        </div>\n    </div>\n</div>\n');
  $templateCache.put('upload.removefile.svg', '<div class="dz-preview dz-file-preview preview-container">\n    <div class="dz-image"><img data-dz-thumbnail /></div>\n    <div class="dz-details">\n        <div class="dz-filename"><span data-dz-name></span></div>\n        <div class="dz-size"><span data-dz-size></span></div>\n    </div>\n    <div class="dz-details">\n        <div class="dz-size"><span data-dz-size></span></div>\n    </div>\n    <div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div>\n    <div class="upload-icons">\n        <div class="dz-error-message"><span data-dz-errormessage></span></div>\n        <div class="dz-success-mark">\n            <svg width="54px" height="54px" viewBox="0 0 54 54" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns">\n                <title>Check</title>\n                <defs></defs>\n                <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">\n                    <path d="M23.5,31.8431458 L17.5852419,25.9283877 C16.0248253,24.3679711 13.4910294,24.366835 11.9289322,25.9289322 C10.3700136,27.4878508 10.3665912,30.0234455 11.9283877,31.5852419 L20.4147581,40.0716123 C20.5133999,40.1702541 20.6159315,40.2626649 20.7218615,40.3488435 C22.2835669,41.8725651 24.794234,41.8626202 26.3461564,40.3106978 L43.3106978,23.3461564 C44.8771021,21.7797521 44.8758057,19.2483887 43.3137085,17.6862915 C41.7547899,16.1273729 39.2176035,16.1255422 37.6538436,17.6893022 L23.5,31.8431458 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z" id="Oval-2" stroke-opacity="0.198794158" stroke="#747474" fill-opacity="0.816519475" fill="#0F9D58" sketch:type="MSShapeGroup"></path>\n                </g>\n            </svg>\n        </div>\n        <div class="dz-error-mark">\n            <svg width="54px" height="54px" viewBox="0 0 54 54" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns">\n                <title>Error</title>\n                <defs></defs>\n                <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">\n                    <g id="Check-+-Oval-2" sketch:type="MSLayerGroup" stroke="#747474" stroke-opacity="0.198794158" fill="#e50000" fill-opacity="0.816519475">\n                        <path d="M32.6568542,29 L38.3106978,23.3461564 C39.8771021,21.7797521 39.8758057,19.2483887 38.3137085,17.6862915 C36.7547899,16.1273729 34.2176035,16.1255422 32.6538436,17.6893022 L27,23.3431458 L21.3461564,17.6893022 C19.7823965,16.1255422 17.2452101,16.1273729 15.6862915,17.6862915 C14.1241943,19.2483887 14.1228979,21.7797521 15.6893022,23.3461564 L21.3431458,29 L15.6893022,34.6538436 C14.1228979,36.2202479 14.1241943,38.7516113 15.6862915,40.3137085 C17.2452101,41.8726271 19.7823965,41.8744578 21.3461564,40.3106978 L27,34.6568542 L32.6538436,40.3106978 C34.2176035,41.8744578 36.7547899,41.8726271 38.3137085,40.3137085 C39.8758057,38.7516113 39.8771021,36.2202479 38.3106978,34.6538436 L32.6568542,29 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z" id="Oval-2" sketch:type="MSShapeGroup"></path>\n                    </g>\n                </g>\n            </svg>\n        </div>\n    </div>\n</div>\n');
}]);
//# sourceMappingURL=index.js.map
