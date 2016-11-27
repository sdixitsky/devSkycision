(function(){

angular
    .module('skyApp.weather')
    .controller('WeatherController',WeatherController);

WeatherController.$inject = [
    '$q',
    '$scope',
    '$log',
    'WeatherService',
    'UserService',
    'MosaicDataService',
    '$interval',
    // 'operations'
];
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

        UserService.getOrg()
        .then( org => MosaicDataService.getOperations(org.orgId) )
        .then( ops => ops.reduce( (p,c) => {
            return p[c.opId] = c, p
        }, {}))
        .then(opsDefer.resolve);
    }
    
    function setOperation( operation ) {
        
        WC.opsMap.then(opsMap => {
            console.log(opsMap)
            return opsMap[operation]
        })
        .then( op => {
            console.log(op);
            $scope.location = {
                name: op.opName,
                lat: op.homeCoord.lat,
                lng: op.homeCoord.lng
            }
            return op.homeCoord || {
                lat: (op.bbox[0]+op.bbox[2])/2,
                lng: (op.bbox[1]+op.bbox[3])/2
            }
        })
        .then( WeatherService.getForecast )
        .then(function(forecasts){
            var forecast = forecasts[0];
            $scope.weatherData = forecast;  
        })
        .catch(err => console.log); 
    }

    function beforeRender($view, $dates, $leftDate, $upDate, $rightDate) {
        angular.noop();
    }
    
    
};

})();