(function() {

angular
    .module('skyApp.flights')
    .directive('flightDownloads',['dateFilter', FlightDownloadsDirective]);

function FlightDownloadsDirective(dateFilter) {
    return {
        template: '<a ng-href="{{::flight[link + \'Url\']}}" download> {{::link | uppercase}} <i class="fa fa-download" aria-hidden="true"></i></a>',
    }
}


})();

