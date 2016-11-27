(function(){
angular
    .module('skyApp.weather')
    .controller('WeatherGraphController',[
        '$scope',
        '$timeout',
        'GraphService',
        'WidgetService',
        '$q',
        'WeatherService',
        '$window',
        WeatherGraphController
    ]);
    
    
function WeatherGraphController($scope, $timeout, GraphService, WidgetService, $q, WeatherService, $window) {
    var mcEl = document.getElementById('monthly-move-chart');
    var vcEl = document.getElementById('monthly-volume-chart');
    var lcEl = document.getElementById('location-chart');
    var fcEl = document.getElementById('fluctuation-chart');



    var GG = this;
    // $scope.$watch('items',function(newValue,oldValue) {
    //     console.log(newValue,oldValue);
    // });
    angular.extend($scope,{

        dashboard: {},

        gridsterOptions: {
            swapping: true,
            margins: [20, 20],
            columns: 6,
            mobileModeEnabled: false,
            draggable: {
                enabled: true,
                // handle: 'h3'
            },
            resizable: {
                enabled: false,
                // enabled: false,
                handles: ['n', 'e', 's', 'w', 'ne', 'se', 'sw', 'nw'],
                // optional callback fired when resize is started
                start: function(event, $element, widget) {},

                // optional callback fired when item is resized,
                resize: function(event, $element, widget) {
                    if (widget.chart.api) widget.chart.api.update();
                },

                stop: function(event, $element, widget) {
                    console.log(event, $element, widget);
                    $timeout(function() {
                        console.log('stopped');
                        widget.chart.api.update();
                    }, 400);
                }
            }
        },

        config: {
            visible: false
        },

        events: {
            resize: function(e, scope) {
                $timeout(function() {
                    if (scope.api && scope.api.update) scope.api.update();
                }, 200)
            }
        }

    });



    WeatherService.getGraphData( getConfig() )
    .then( graphData => GraphService.createGraphs(graphData) )
    .then( graphs    => WidgetService.createWidgets(graphs) )
    .then( widgets   => {
        console.log(widgets);
        $scope.dashboard.widgets = widgets;

        $timeout(function(){
            $scope.config.visible = true;
            startCrossFilters();
        }, 1000);
    });

    // angular.element($window).on('resize', function(e){
    //     $scope.$broadcast('resize');
    // });

    // We want to hide the charts until the grid will be created and all widths and heights will be defined.
    // So that use `visible` property in config attribute
   
    function updateSize({ c: chart, e: el, hFn: h, wFn: w}) {
        chart
        .width(
            w(el.offsetWidth)
        ).height(
            h(el.offsetHeight)
        ).transitionDuration(0);
    }



/////////
// d3.json('static/json/california.geojson', california => { 
function startCrossFilters() {
    WeatherService.getHistorical()
    .then( d => $q( (resolve,reject) => {
        $q.when(d).then(resolve,reject)
    }))
    .then( data => {
        var gddTracker = document.getElementById('gddTracker');
        // var moveChart = dc.compositeChart('#monthly-move-chart'),
        var moveChart = dc.lineChart('#monthly-move-chart'),
            moveWidth = mcEl.offsetWidth,
            moveHeight = mcEl.offsetHeight;

        var volumeChart = dc.barChart('#monthly-volume-chart'),
            volumeWidth = vcEl.offsetWidth,
            volumeHeight = vcEl.offsetHeight;

        var locationChart = dc.bubbleChart("#location-chart"),
            locationWidth = lcEl.offsetWidth,
            locationHeight = lcEl.offsetHeight;

        var fluctuationChart = dc.barChart('#fluctuation-chart'),
            fluctuationHeight = fcEl.offsetHeight,
            fluctuationWidth  = fcEl.offsetWidth;

        var charts = [{
                c: moveChart,
                e: gddTracker,
                hFn: h => 0.8*h,
                wFn: w => w,
            },{
                c: volumeChart,
                e: gddTracker,
                hFn: h => 0.15*h,
                wFn: w => w,
            },{
                c: locationChart,
                e: lcEl,
                hFn: h => h,
                wFn: w => w,
            },{
                c: fluctuationChart,
                e: fcEl,
                hFn: h => h,
                wFn: w => w,
            }];

        angular.element($window).on('resize', e => {
            charts.map(updateSize);
            dc.renderAll();
            // dc.events.trigger(dc.renderAll, 20);
            charts.map( ({c: chart}) => chart.transitionDuration(750) );
        });

        var numericProperties = ['tmin','gdd','precipAccum','windSpeed','cloudCover','windBearing','tmax','humidity','lat','lng'];
        var dateFormat = d3.time.format('%m/%d/%Y');
        var numberFormat = d3.format('.2f');
        
        angular.forEach(data, d => {
            d.year = d3.time.year(d.date).getFullYear();
            d.month = d3.time.month(d.date);

            numericProperties.forEach( p => {
                d[p] = angular.isNumber(d[p]) ? parseFloat(d[p]) : null;
            }); 
        });

        // var endDate = d3.max(_data, d => d.date );
        // var oneYearPrior = new Date(endDate.getUTCMilliseconds() - 365*24*3600*1000);

        // var data = _data.filter( v => v.date >= oneYearPrior );

        var ndx = crossfilter(data);
        var all = ndx.groupAll();

        var nameDimension = ndx.dimension( d => d.name );
        var latDimension = ndx.dimension( d => d.lat ),
            latDomain = latDimension.bottom(1).concat(latDimension.top(1)).map( c => c.lat);
        var lngDimension = ndx.dimension( d => d.lng ),
            lngDomain = lngDimension.bottom(1).concat(lngDimension.top(1)).map( c => c.lng);

        // console.log(latDomain,lngDomain);



        var locationDimension = ndx.dimension( d => ([d.lng,d.lat]) );
        var locationGroup = locationDimension.group();
        console.log(locationDimension);

        var dateDimension = ndx.dimension( d => d.date );
        var monthlyDimension = ndx.dimension( d => d.month );
        var yearlyDimension = ndx.dimension( d => d.year );

        var dateExtent = d3.extent(data.map( d => d.date));
        var dateDomain = dateExtent.map( d => new Date(d));

        var dailyGDDMove = dateDimension.group().reduceSum( d => d.gdd );
        var dailyPrecipMove = dateDimension.group().reduceSum( d => d.precipAccum );

        var monthlyGDDMove = monthlyDimension.group().reduceSum( d => d.gdd );
        var monthlyPrecipMove = monthlyDimension.group().reduceSum( d => d.precipAccum );

        var tempAvgByDayGroup = dateDimension.group().reduce(reduceAddAvgWithMean('tmax','tmin'),reduceRemoveAvgWithMean('tmax','tmin'),reduceInitAvg);
        var gddAvgByMonthGroup = dateDimension.group().reduce(reduceAddAvg('gdd'), reduceRemoveAvg('gdd'), reduceInitAvg);


        var reducers = [
            (p,v) => {
                ++p.count;
                p.lat = v.lat;
                p.lng = v.lng;
                p.name = v.name;
                p.absGain = v.gdd;
                p.sumGdd += v.gdd;
                p.avgGdd = p.sumGdd / p.count;
                p.percentageGain = p.avgGdd ? (p.absGain / p.avgGdd) * 100 : 0;
                return p;
            },
            /* callback for when data is removed from the current filter results */
            (p, v) => {
                --p.count;
                p.lat = v.lat;
                p.lng = v.lng;
                p.name = v.name;
                p.absGain = v.gdd;
                p.sumGdd -= v.gdd;
                p.avgGdd = p.count ? p.sumGdd / p.count : 0;
                p.percentageGain = p.avgGdd ? (p.absGain / p.avgGdd) * 100 : 0;
                return p;
            },
            /* initialize p */
            () => ({
                count: 0,
                lat: 0,
                lng: 0,
                name: '',
                absGain: 0,
                sumGdd: 0,
                avgGdd: 0,
                percentageGain: 0
            })
        ];
        
        // wait for window resizes
        // angular.element($window).on('resize', $scope.$apply.bind($scope));

        // $scope.$watch(function() {
        //     return el.clientWidth * el.clientHeight
        // }, function() {
        //     width = el.clientWidth;
        //     height = el.clientHeight;
        //     resize();
        // });

        var locationGDDGroup = nameDimension.group().reduce(...reducers);
        var yearlyGDDSumGroup = nameDimension.group().reduceSum( d => d.gdd );
        var yearlyGDDSumDomain = d3.extent(yearlyGDDSumGroup.top(1).push(yearlyGDDSumGroup.all().reverse()[0], dd => dd.value ));

        console.log(locationGDDGroup.all());
        console.log(yearlyGDDSumGroup.all());
        // var [latDomain,lngDomain] = [0,1].map(indx => d3.extent(california.geometry.coordinates, c => c[indx]));
        // console.log(latDomain,lngDomain)
        locationChart
            .width(locationWidth)
            .height(locationHeight)
            .transitionDuration(1000)
            .margins({top: 80, right: 50, bottom: 25, left: 50})
            .dimension(nameDimension)
            .group(locationGDDGroup)
            .x(d3.scale.linear().domain(lngDomain))
            .y(d3.scale.linear().domain(latDomain))
            // .r(d3.scale.linear().domain([3700,6400]))
            .elasticRadius(true)
            // .minRadius(1)
            // .colors(colorbrewer.RdYlGn[9])
            // .colorDomain(d3.scale.linear().domain([3700,4400]))
            // .colorAccessor( p => p.value.sumGdd )
            .keyAccessor( p => p.value.lng )
            .valueAccessor( p => p.value.lat )
            .radiusValueAccessor( p => p.value.sumGdd )
            .maxBubbleRelativeSize(0.1)
            .xAxisPadding(0.1)
            .yAxisPadding(0.1)
            .elasticX(true)
            .elasticY(true)
            .xAxisLabel('Latitude')
            .yAxisLabel('Longitude')
            .renderLabel(true)
            .label( p => p.key )
            .renderTitle(true)
            .title(function (p) {
                return [
                    p.key,
                    'Index Gain: ' + numberFormat(p.value.absGain),
                    'Index Gain in Percentage: ' + numberFormat(p.value.percentageGain) + '%',
                    'Fluctuation / Index Ratio: ' + numberFormat(p.value.fluctuationPercentage) + '%'
                ].join('\n');
            })
            // .legend(dc.legend().x(400).y(10).itemHeight(13).gap(5))
            // 
            // .clipPadding(10)
            // .excludedOpacity(0.5)

        // locationChart.overlayGeoJson(california);

        var dailyGDDGroup =  dateDimension.group().reduce(...reducers);

        moveChart
            .x(d3.time.scale().domain(dateDomain))
            .width(moveWidth)
            .height( moveHeight * 0.8 )
        // .compose([
            // dc.lineChart(moveChart)
            .renderArea(true)
            .transitionDuration(1000)
            .margins({top: 30, right: 50, bottom: 25, left: 50})
            .dimension(dateDimension)
            .mouseZoomable(true)
            .rangeChart(volumeChart)
            .round(d3.time.day.round)
            .xUnits(d3.time.days)
            .elasticY(true)
            .renderHorizontalGridLines(true)
            .legend(dc.legend().x(80).y(40).itemHeight(13).gap(5))
            .brushOn(false)
            .group(dailyGDDGroup, 'Accumulated GDD (past year)')
            .valueAccessor( d => d.value.sumGdd )
            .stack(dailyGDDGroup, 'Daily GDD', d => d.value.absGain )
            .title( d => {
                var value = d.value.avg ? d.value.avg : d.value;
                if (isNaN(value)) {
                    value = 0;
                }
                return dateFormat(d.key) + '\n' + numberFormat(value);
            })
                //,
        //     dc.lineChart(moveChart)
        //         .group(dailyGDDGroup, 'Average Daily GDD', d => d.value.avgGdd)
        //         .elasticY(true)
        // ]);

        volumeChart
            .width(volumeWidth)
            .height( moveHeight * 0.15)
            .margins({top: 0, right: 50, bottom: 20, left: 50})
            .dimension(dateDimension)
            .group(tempAvgByDayGroup)
            .valueAccessor( d => d.value.avg )
            .centerBar(true)
            .gap(1)
            .x(d3.time.scale().domain(dateDomain))
            .round(d3.time.day.round)
            .alwaysUseRounding(true)
            .xUnits(d3.time.days)
            .yAxis().ticks(0);

        var fluctuation = ndx.dimension( d => Math.round(d.tmax-d.tmin) );
        var fluctuationGroup = fluctuation.group();

        fluctuationChart 
            .width(fluctuationWidth)
            .height(fluctuationHeight)
            .margins({top: 60, right: 50, bottom: 30, left: 50})
            .dimension(fluctuation)
            .group(fluctuationGroup)
            .elasticY(true)
            .centerBar(true)
            .gap(1)
            .round(dc.round.floor)
            .alwaysUseRounding(true)
            .x(d3.scale.linear().domain([0, 30]))
            .renderHorizontalGridLines(true)
            .filterPrinter(function (filters) {
                var filter = filters[0], s = '';
                s += numberFormat(filter[0]) + '% -> ' + numberFormat(filter[1]) + '%';
                return s;
            });

        fluctuationChart.xAxis().tickFormat( v => v + 'F')
        fluctuationChart.yAxis().ticks(5);

        dc.renderAll();

    })
    function reduceAddAvg(attr) {
        return function(p, v) {
            ++p.count
            p.total += v[attr];
            p.avg = p.total / p.count;
            return p;
        };
    }

    function reduceRemoveAvg(attr) {
        return function(p, v) {
            --p.count
            p.total -= v[attr];
            p.avg = p.total / p.count;
            return p;
        };
    }

    function reduceAddAvgWithMean(prop1, prop2) {
        return function(p, v) {
            ++p.count;
            p.total += (v[prop1] + v[prop2]) / 2;
            p.avg = Math.round(p.total / p.count);
            return p;
        }
    }

    function reduceRemoveAvgWithMean(prop1, prop2) {
        return function(p, v) {
            --p.count;
            p.total -= (v[prop1] + v[prop2]) / 2;
            p.avg = p.count ? Math.round(p.total / p.count) : 0;
            return p;
        }
    }

    function reduceInitAvg() {
        return { count: 0, total: 0, avg: 0 };
    }
}
    
/////////


    function getConfig() {
        return  [
            {
                xConfig: {
                    param: 'time',
                    unit: 'DAY',
                    label: 'Day',
                    axisStyle:'absolute'
                },
                yConfig:  {
                    unitFmt: '2.0f',
                    unit: 'F',
                    axisLabel: 'Temperature (F)',
                    axisStyle: [0, 120],//'absolute',
                    yParams: [{
                        param: 'temperatureMax',
                        key: 'Max. Temp.',
                        // color:'#ff7f0e',
                        area:false
                    },{
                        param: 'temperatureMin',
                        key: 'Min. Temp.',
                        // color:'#7777ff',
                        area:false
                    }]
                },
                title: 'Actual Temperatures',
                location: {lat:38.431175,lng: -122.3476730}
            },
            // {
            //     xConfig: {
            //         param: 'time',
            //         unit: 'DAY',
            //         label: 'Days',
            //         axisStyle:'absolute' // [min, max]
            //     },
            //     yConfig:  {
            //         yParams: [{
            //             param: 'precipProbability',
            //             key: 'Chance of Rain',
            //             // color:'#ff7f0e',
            //             area:false
            //         }],
            //         unitFmt: '.0f',
            //         unit: '%',
            //         axisLabel: 'Chance of Rain (%)',
            //         axisStyle: [0,100]
            //     },
            //     title: 'Chance of Rain',
            //     location: {lat:38.431175,lng: -122.3476730}
            // },
            {
                xConfig: {
                    param: 'time',
                    unit: 'DAY',
                    label: 'Days',
                    axisStyle:'absolute' // [min, max]
                },
                yConfig:  {
                    yParams: [{
                        param: 'humidity',
                        key: 'Humidity',
                        // color:'#ff7f0e',
                        area:false
                    },{
                        param: 'cloudCover',
                        key: 'Cloud Cover',
                        // color:'#ff7f0e',
                        area:false
                    }],
                    unitFmt: '.2f',
                    unit: '',
                    axisLabel: '',
                    axisStyle: [0,1],
                },
                
                title: 'Humidity & Cloud Cover',
                location: {lat:38.431175,lng: -122.3476730}
            },
        ];
    }

};
})();