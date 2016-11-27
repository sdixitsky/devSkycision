(function() {
    angular
        .module('skyApp.flights')
        .controller('FlightsController',FlightsController)
        .run(["ngTableDefaults",configureDefaults]);

FlightsController.$inject = ['$scope', '$state', 'UserService', 'NgTableParams', 'FlightsService'];
function FlightsController($scope, $state, UserService, ngTableParams, FlightsService) {
    
    var FC = this;
    
    FC.cols = [{
        field : "op-name",
        title : "Op",
        sortable : "op-name",
        show : true,
        //groupable : "op-name",
        displaygroup: {stats:["Altitude","Start","Duration"], links:['png','pdf','shp','tif']}
    }, {
        field : "block-id",
        title : "Block",
        sortable :  "block-id",
        show : true,
    }, {
        field : "start",
        title : "Date",
        sortable : "start",
        show : true
    }];

    FlightsService.loadFlights()
    .then( flights => {

        FC.tableParams = new ngTableParams({
            // initial grouping
            group : {
                "op-name" : "desc"
            }
        }, {
            dataset : flights
        });

    });
    
}

function configureDefaults(ngTableDefaults) {
    ngTableDefaults.params.count = 10;
    ngTableDefaults.settings.counts = [];
}

})();

