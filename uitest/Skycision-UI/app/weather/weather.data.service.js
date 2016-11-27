(function(){

angular
    .module('skyApp.weather')
    .provider('WeatherService',[WeatherServiceProvider]);

function WeatherServiceProvider() {

    const dayMillis = 86400000;

    var self = this;
    self.wk = null;
    self.setup = function(val) {
        self.wk = val;
    }
    
    self.$get = ['$http','$q','$cacheFactory','$log', function($http, $q, $cacheFactory,$log) {
        var forecastCache = $cacheFactory('forecast',{capacity:5});
        var service = {
            getForecast: getForecast,
            getHistorical: getHistorical,
            getElevation: getElevation,
            getGraphData: getGraphData
        };

        return service;

        function getHistorical() {
            return $http({
                method: 'GET',
                url: "app/weather/historical.json"
            })
            .then( response => 
                response.data.locations
                    .map(processHistorical)
                    .reduce( (p,c) => p.concat(c) , [] )
            );
        }

        function getElevation(location) {
                var payloadPromise = validateLocation(location);

                return payloadPromise.then( body => $http({
                    method: 'GET',
                    url:'https://4x8ke86kga.execute-api.us-east-1.amazonaws.com/dev/elevation/'+location.lat+'/'+location.lng,
                    headers: {
                        "X-Api-Key": self.wk || undefined
                    }
                }))
                .then( response => {
                    return location;
                })
                .then( loc => {
                    return $http({
                        method: 'POST',
                        url: 'https://4x8ke86kga.execute-api.us-east-1.amazonaws.com/dev/elevation',
                        data: payloadPromise,
                        headers: {
                            "X-Api-Key": self.wk || undefined
                        }
                    });
                });
        }

        function validateLocation(location) {
            return $q( (resolve,reject) => {
                var body = {"latlons":[]};
                switch (typeof location) {
                    case "object":
                        if (!!!location.lat || !!!location.lng) {
                            reject('argument must be a latlngLiteral or array of latlngLiterals');
                        }
                        body.latlons.push(
                            ( l =>
                                ([l.lat,l.lng])
                            )(location)
                        );
                        resolve(body);
                        break;
                    case "array":
                        body.latlons.push(location.filter(l => 
                            (!!l.lat && !!l.lng) ? true : false
                        )
                        .map(
                            l => ( [l.lat,l.lng] )
                        ));
                        resolve(body);
                        break;
                    case "undefined":
                    default:
                        reject('argument must be a latlngLiteral or array of latlngLiterals');
                }
                resolve(body);
            });
        }

        function getForecasts(locations) {
            return $q.all(locations.map(getForecast));
        }

        function getForecast(location){
            return $q( (resolve,reject) => {


                // prefer multiple GET requests to a POST because the GETs are automatically cached
                //      (all requests to same URL– even before response – return the same Promise,
                //       which is resolved by the eventual response)
                $http({
                    method: 'GET',
                    url: `https://4x8ke86kga.execute-api.us-east-1.amazonaws.com/dev/forecast/${location.lat}/${location.lng}`,
                    headers: { "X-Api-Key": self.wk },
                    cache: forecastCache
                })
                .then( response => {
                    return resolve(response.data.forecast);
                })
                .catch( err => {
                    console.log(err);
                    reject(err);
                });

            });
        }

        // function processLocation(location) {

        //     var result = {};
        //     result.coord = {lat: location.lat, lng: location.lon};
        //     result.name = location.name;
        //     result.startTime = new Date(location.start);
        //     result.stopTime = new Date(location.stop);
        //     return processHistorical(location)
        //     .then(w => {
        //         result.records = w;
        //         return result;
        //     });
        // }

        function processHistorical(location) {
            var weather = location.weather,
                  start = location.start,
                   stop = location.stop,
                   name = location.name,
                    lat = location.lat,
                    lng = location.lon;
            (!!!lat || !!!lng) && console.log('null found',location);

            var startMillis = new Date(start).getTime();
            var stopMillis = new Date(stop).getTime();

            var keys = [];  angular.forEach(weather, (_,key) => keys.push(key));
            var properties = keys.map( k => weather[k] );
            var l = properties.length;
            
            var length = properties.map( v => v.length ).reduce( (p,c) => p+c/l , 0);

            // for every day (element of result array)
            return weather.gdd.map( (val, dayIndex) => {
                // create a day object w/ start date and # days elapsed
                var record = {
                    date: new Date(startMillis+dayIndex*dayMillis),
                    name: name,
                    lat: lat,
                    lng: lng,
                };

                // for each weather property, set this day's corresponding property
                // equal to the correct index into the original property array.
                //
                //    transforms from this         to this
                //      {                               [{
                //          "tmin": [],                     "tmin": ,
                //          "gdd": [],                      "gdd": ,
                //          "precip accum": [],             "precip accum": ,
                //          "wind speed": [],               "wind speed": ,
                //          "cloud cover": [],              "cloud cover": ,
                //          "wind bearing": [],             "wind bearing": ,
                //          "tmax": [],                     "tmax": ,
                //          "humidity": []                  "humidity": ,
                //      }                               }]

                keys.forEach( k => {
                    record[angular.element.camelCase(k.replace(' ','-'))] = weather[k][dayIndex];
                });
                return record;
            }).filter( (d) => (2015 == d.date.getUTCFullYear()) );
        }

        function getGraphData(config) {
            return $q.all(config.map( c => getGraphDatum(c)) );
        }

        function getGraphDatum(config) {

            return service.getForecast(config.location)
            .then( datum => {
                var forecast = datum[0].daily.data,
                    xc = config.xConfig,
                    yc = config.yConfig;

                function getConversion(_yc,i) {
                    return function(inval) {
                        switch(_yc.yParams[i].param) {
                            case 'temperatureMin':
                            case 'temperatureMax':
                            case 'apparentTemperatureMin':
                            case 'apparentTemperatureMax':
                                return (_yc.unit === 'F' && datum[0].flags.units === 'si') ? Number( (inval*9/5+32).toFixed(1) ) : inval;
                                break;
                            case 'precipProbability':
                            case 'humidity':
                            case 'cloudCover':
                                return (_yc.unit === '%') ? Math.round(inval*100) : Number( inval.toPrecision(3) );
                                break;
                            default:
                                return inval;
                        }
                    }
                }


                config.chartdata = yc.yParams.map( (c,i) => {
                    var newValues = forecast.map( d => ({
                        x:d[xc.param],
                        y:getConversion(yc,i)(d[c.param])
                    }));
                    return angular.extend(c, {
                        values: newValues
                    });
                });
                return config;
            });
        }

    }];
    
};

})();