(function() {

angular
    .module('skyApp.weather')
    .filter('degCToDegF',function() {
        return function(forecast) {
                
            function mapper(datum) {
                var out = angular.copy(datum);
                out.temperatureMin = datum.temperatureMin * 9 / 5 + 32;
                out.apparentTemperatureMin = datum.apparentTemperatureMin * 9 / 5 + 32;
                out.temperatureMax = datum.temperatureMax * 9 / 5 + 32;
                out.apparentTemperatureMax = datum.apparentTemperatureMax * 9 / 5 + 32;
                out.temperature = datum.temperature * 9/5 + 32;
                return out;
            }

            angular.forEach(forecast,function(value,key) {
                if (key.endsWith('ly')) {
                    if (!!value.data) {
                        forecast[key].data = value.data.map(mapper);
                    } else {
                        forecast[key] = mapper(value);
                    } 
                }
            });
            return forecast;
        }
    })
    .directive('forecastWidget', ['ForecastService', 'degCToDegFFilter', 'TEMPLATE_DIR', ForecastWidget]);

function ForecastWidget(ForecastService, degCToDegFFilter, TEMPLATE_DIR) {
    ForecastWidgetController.$inject = ['$scope', '$element', '$attrs'];

    return {
        restrict: 'E',
        templateUrl: TEMPLATE_DIR + 'weather.widget.partial.html',
        link: ForecastWidgetController
    }

    function ForecastWidgetController(scope, element, attrs) {
        var forecastData = false;

        ForecastService.generateWidget({
            units: 'si',
            title: '',
            lat: scope.location.lat, lon: scope.location.lng
        });

        var unwatch = scope.$watch('weatherData', function(newValue, oldValue) {
            // console.log(newValue,oldValue);
            if (newValue !== oldValue || !!!forecastData && !!newValue) {
                forecastData = true;
                var convertedData = degCToDegFFilter(newValue)
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
