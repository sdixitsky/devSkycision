(function (){
    angular
        .module('skyApp.root')
        .config(['$stateProvider', '$urlRouterProvider','$urlMatcherFactoryProvider',  configRootStates]);

    function configRootStates($stateProvider, $urlRouterProvider, $urlMatcherFactoryProvider) {
        // $urlMatcherFactoryProvider.strictMode(false)


        $urlRouterProvider.otherwise('/login');
        // $urlRouterProvider.otherwise(function($injector) {
        //     var $state = $injector.get("$state");
        //     $state.go("login");
        // });



        $stateProvider
        .state('login', {
            name: 'login',
            url:'/login',
            templateUrl: 'templates/signup/signup-view.html',
            controller: 'SignupController',
            controllerAs: 'sc',
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