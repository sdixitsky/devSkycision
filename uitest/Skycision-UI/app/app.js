(function() {

    angular
        .module('skyApp', [
            // 'ngRoute',
            "ui.router",
            'ngAnimate',
            'ngMaterial',
            'ngSanitize',
            'ngAria',
            'ngCookies',
            'rzModule',
            'angular-walkthrough',
            'skyApp.root',
            'skyApp.users',
            'skyApp.mosaic',
            'skyApp.utils',
            'skyApp.upload',
            'skyApp.signup',
            'skyApp.weather',
            'skyApp.grid',
            'skyApp.gallery',
            'skyApp.feedback',
            'skyApp.flights',
            'skyApp.tour',
            'skyApp.myfarm'
        ])
        .config([
            'AWSServiceProvider',
            ConfigureAWS
        ])
        .config([
            '$httpProvider',
            ConfigureHttpProvider
        ])
        .config([
            'WeatherServiceProvider',
            ConfigureWeather
        ])
        .config(['$mdThemingProvider',
            function($mdThemingProvider) {
                $mdThemingProvider.theme('default')
                    .primaryPalette('blue-grey', {
                        'default': '800'
                    })
                    .backgroundPalette('grey', {
                        'default': '100'
                    })
                    .accentPalette('light-blue', {
                        'default': '600'
                    })
            }
        ])
        .constant({
            'TEMPLATE_DIR': '/templates/'
        })
        .constant({
            'LAMBDA_POST_VER': (window.location.protocol !== 'https' || !window.location.hostname.contains('skycision')) ? 'DEV' : 'BETA'
        })
        // .config(['$compileProvider', function ($compileProvider) {
        //   $compileProvider.debugInfoEnabled(false);
        // }])
        .run([
            'AWSService',
            'AuthService',
            '$rootScope',
            '$state',
            '$stateParams',
            RunBlock
        ]);

    function ConfigureRoutes($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
                controller: 'MainController',
                controllerAs: 'mc',
                templateUrl: 'templates/mosaic.html'
            })
            .when('/signup', {
                controller: 'SignupController',
                controllerAs: 'sc',
                templateUrl: 'templates/signup-view.html'
            })
            .when('/login', {
                controller: 'SignupController',
                controllerAs: 'sc',
                templateUrl: 'templates/signup-view.html'
            })
            .otherwise({
                redirectTo: '/login'
            });
    }

    function RunBlock(AWSService, AuthService, $rootScope, $state, $stateParams) {
        console.log('runblock')
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

window.onbeforeunload = function() {
    console.clear();
    console.log('onbeforeunload');
};

angular.element(document).ready(function() {
    angular.bootstrap(document, ['skyApp'], {
        strictDi: true
    });
});


function logMessage(message) {
    return (!!message) ? function() {
        var errors = [...arguments].filter(function(arg) {
            return (arg instanceof Error);
        }).map(function(err) {
            err.stack.replace('↵', '\n');
            return err;
        });
        if (errors.length > 0) {
            errors.map((err) => logMessage(err));
        } else {
            angular.noop();
        }
        console.timeStamp();
        console.log(message, [...arguments]);
    } : function() {
        var e = arguments[0];
        var message = arguments[0].message + '\n' + e.sourceURL.replace(window.href, '') + ':' + arguments[0].line + ':' + arguments[0].column + '\n';
        console.timeStamp('err stamp');
        console.log("%c" + message, 'background-color: hsla(120, 60%, 70%, 0.3);', arguments[0].stack);
    };
}