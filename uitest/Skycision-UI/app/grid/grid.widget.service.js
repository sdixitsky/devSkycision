(function(){
angular
    .module('skyApp.grid')
    .factory('WidgetService', [
        '$q',
        WidgetService
    ]);


function WidgetService($q) {
    var service = {};

    service.createWidgets = createWidgets;
    return service;
    /*
     *  Data & Options Generators
     */

     function createWidgets(graphs) {
        return $q.all(graphs).then(gs => {
            return gs.map(createWidget);
        });
        
     }

     function createWidget({
        chartoptions: opts,
        chartdata: data,
        title: name,
        dims: {
            col: c,
            row: r,
            sizeX: x = 2,
            sizeY: y = 1,
        } = {}
    }) {
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
         }
     }

    
};

})();