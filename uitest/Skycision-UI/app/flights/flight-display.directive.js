(function() {

angular
    .module('skyApp.flights')
    .directive('flightDisplay', ['$templateCache', FlightDisplay]);

function FlightDisplay($templateCache) {
    return {
        template: $templateCache.get('flights/flight-display.partial.html')
    }
}


})();

