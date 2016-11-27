(function(){
angular
    .module('skyApp.weather')
    .directive('weatherSeries', WeatherSeries);

WeatherSeries.$inject = ['WeatherService', 'ForecastService'];
function WeatherSeries(WeatherService, ForecastService) {
    WeatherSeriesController.$inject = ['$scope', '$element','$attrs'];

    return {
        restrict: 'E',
        scope: {
            forecast: '='
        },
        link: WeatherSeriesController
    }
    
    function WeatherSeriesController(scope, element, attrs) {
        var wsc = this;

        // scope.$watch('forecast',function(forecast){
            
        // })

    }
}

})();