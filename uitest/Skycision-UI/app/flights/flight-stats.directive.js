(function() {

angular
    .module('skyApp.flights')
    .directive('flightStats',['dateFilter', FlightStatsDirective]);

function FlightStatsDirective(dateFilter) {

    return {
        template: '<label><strong>{{::displayField}}</strong></label><span>{{::displayFlight(flight,displayField)}}</span>',
        controller: ['$scope','$element','$attrs', ($scope, $element, $attrs) => {

            $scope.displayFlight = displayFlight

            function displayFlight(flight, prop) {
                switch (prop) {
                    case 'Start':
                        return dateFilter(flight[prop.toLowerCase()]*1000,'mediumTime');
                        break;
                    case 'Duration':
                        return moment.duration(  (flight.end - flight.start)*1000 ).humanize();
                        break;
                    case 'Altitude': 
                        return `${flight[prop.toLowerCase()]}m`
                        break;
                    default:
                        return flight[prop.toLowerCase()];
                }
            }

        }],
        controllerAs: 'ctrl'
    }

}


})();

