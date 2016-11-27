(function($){
angular
	.module('skyApp.grid')
	.factory('GraphService', [
        '$q',
        GraphService
    ]);

function GraphService($q) {
    var service = {}; 
    var DateType = {
        MINUTE: 'MINUTE',
        HOUR : 'HOUR',
        DAY : 'DAY',
        WEEK : 'WEEK',
        YEAR : 'YEAR'
    }

    Object.freeze(DateType);


    service.createGraphs = createGraphs;

    return service;


    function createGraphs(config) {
        var _config = config;
        return $q.all(config.map((c) => {
            return $q( (resolve,reject) => {
                createGraph(c)
                // .then(formatDataForChart)
                .then(resolve)
                .catch( err => {
                    console.log(error);
                    reject(err)
                });
            });
        }));
    }

    /*
     *  Data & Options Generators
     */
    function createGraph(config) {
        // var o = d3.scale.linear().domain(getDomain('y',config)).range(colorbrewer.RdBu[5]);
        return config.chartoptions = {
            chart:  {
                // color: ((d,i) => {
                //     console.log(d,i);
                //     return o(d.values[i].y)
                // }),
                type: 'lineChart',
                margin: config.margin || {
                    top: 10,
                    right: 30,
                    bottom: 90,
                    left: 70,
                },
                xDomain: getDomain('x',config),
                yDomain: getDomain('y',config),
                x: ( d  => d.x),
                y: ( d  => d.y),
                useInteractiveGuideline: true,
                xAxis: getAxis(config.xConfig),
                yAxis: getAxis(config.yConfig),
                callback: ( () => {console.log("!!! lineChart callback !!!")} ),
                interpolate: 'linear',
            },
            title: config.header || {
                enable: true,
                text: '',
                css: {
                    'padding-top': '40px',
                    'padding-left': '20px',
                    'padding-right': '20px',
                },
            },
            subtitle: config.subtitle || {
                enable: true,
                text: '',
                css: {
                    'text-align': 'center',
                },
            },
            styles: {
                classes: {
                    'with-transitions': true,
                },
            },
        }, $q.when(config);
        
    }

    function getAxis(config) {
        // value we can infer from types in config
        var days = (config.unit == DateType.DAY) ? 6 : null;

        return {
            axisLabel: config.axisLabel,
            tickFormat: getTickFormat(config),
            ticks: config.ticks || undefined,
            tickWidth: config.tickWidth || undefined
        }
    }

    function getDomain(axisName, config) {
        var cfg = config[`${axisName}Config`];
        var domain, max, min;
        if (!!cfg.param && cfg.param === 'time') {
            return undefined;
        } else if ('object' === typeof cfg.axisStyle) {
            return cfg.axisStyle;
        } else if (!!cfg.yParams && angular.isArray(cfg.yParams)) {
            domain = [];
            max = d3.max(config.chartdata.map( cd => 
                d3.max(cd.values.map(v => v.y))
            ) );
            switch (cfg.axisStyle) {
                case 'absolute':
                    domain = [0, max];
                    break; 
                case 'relative':
                    min = d3.min(config.chartdata.map( cd => 
                        d3.min(cd.values.map(v => v.y))
                    ) );
                    domain = [min,max];
                    break;
            }
            return domain;
        }
        

        domain = [];
        max = d3.max(config.chartdata.map(p => p[axisName]));
        switch (cfg.axisStyle) {
            case 'absolute':
                domain = [0, max];
                break; 
            case 'relative':
                min = d3.min(config.chartdata.map(p => p[axisName]));
                domain = [min,max];
                break;
        }
        return domain;
    }

    // function formatDataForChart(config) {
    //     return config.chartdata = {
    //         key: config.title,
    //         values: config.data,
    //         color: config.color,
    //         area: config.area
    //     }, config;
    // }

    function getTickFormat(config) {
        if (config.param === "time"){
            return getDateFormat(config.unit)
        } else {
            return function(d) {
                return d3.format(config.unitFmt)(d);
            }
        } 
    }

    function getDateFormat(dateType) {
        var formatString;
        switch (dateType) {
            case DateType.MINUTE:
                formatString = '%M';
                break; 
            case DateType.HOUR:
                formatString = '%h';
                break;
            case DateType.DAY:
                formatString = '%a';
                break;
            case DateType.MONTH:
                formatString = '%b';
                break; 
            case DateType.YEAR:
                formatString = '%Y';
                break; 
        }
        return function(d) {
            return d3.time.format(formatString)(new Date(d * 1000))  
        };
    }

    
};

})(jQuery);