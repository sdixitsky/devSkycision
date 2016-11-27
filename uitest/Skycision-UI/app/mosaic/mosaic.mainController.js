(function() {

    angular
        .module('skyApp.mosaic')
        .controller('MainController', [
            '$scope',
            '$log',
            '$timeout',
            '$interval',
            '$q',
            '$compile',
            'UserService',
            'theOperations',
            '$state',
            'MosaicDataService',
            MainController
        ]);

    function MainController($scope, $log, $timeout, $interval, $q, $compile, UserService, operations, $state, MosaicDataService) {

        // Alias for the controller object to avoid
        // confusion inside function scopes, etc
        var MC = this;
        MC.expandctrls = false;
        var map;
        MC.operations = operations;
        MC.show = true;
        /*
        For clarity, all methods added to the MainController object (aliased above from "this" to "MC")
        or the $scope object should be defined as function declarations and assigned to the property of 
        the same name on the object.
        Keep those assignments relatively organized and towards the top of the file.

        This works because function declarations are hoisted to the top of their scope, unlike vars or
        function expressions.

        As time permits, a lot of these methods should be bundled into their own services (all the map
        plotting, etc.) because the M/V/C separation is pretty blurred right now.
        */

        MC.activate = activate;

        // app state switching methods
        MC.loadTiles = loadTiles;

        // map zoom method, accepts bbox
        // MC.setOperation = setOperation;
        MC.setBBox = setBBox;

        // flightplanning methods
        MC.generateFields = generateFields;
        MC.confirmField = confirmField;

        // important local state variables
        MC.farmToDraw = null;
        MC.doneAdd = false;

        MC.initMap = initMap;

        MC.getMap = getMap;
        var mapDefer = $q.defer();
        var mapPromise = mapDefer.promise;

        MC.activate();

        function activate() {
            angular.extend($scope, {
                savedFields: [],
                fieldInProgress: null,
                markers: [],
                newFieldName: '',
                addMode: false,
                getMap: getMap,
                setDetailOperation: setOperation,
                // mapActive: $state.current.mapActive
            });

            // initMap();

            UserService.getUser()
                .then(user => {
                    $scope.user = user;
                })
            UserService.getOrg()
                .then(org => {
                    MC.orgs = [org];
                    MC.currentOrg = org;
                    $timeout(() => {
                        MC.initMap(org);
                    }, 250);
                });
        }


        function getMap() {
            console.log('MainController getMap');
            return mapPromise;
        }

        function handleResize() {
            if (map) {
                var center = map.getCenter();
                google.maps.event.trigger(map, "resize");
                map.setCenter(center);
            }
        }

        //Map initialization  
        function initMap(org) {

            map = new google.maps.Map(document.getElementById('map'), {
                center: {
                    "lat": 37.09024,
                    "lng": -95.712891
                },
                zoom: 6,
                mapTypeId: google.maps.MapTypeId.SATELLITE,
                zoomControl: true,
                zoomControlOptions: {
                    style: google.maps.ZoomControlStyle.LARGE,
                },
                scaleControl: true,
                rotateControl: true,
                fullscreenControl: false,
                tilt: 0,
                // minZoom: 2,
                draggableCursor: 'default',
                mapTypeControlOptions: {
                    style: google.maps.MapTypeControlStyle.DEFAULT,
                    position: google.maps.ControlPosition.TOP_CENTER
                },
                zIndex: 3
            });
            $scope.map = map;
            mapDefer.resolve(map);

            MC.setBBox(org.bbox);

            var drawingManager = new google.maps.drawing.DrawingManager({
                map: map,
                drawingControl: true,
                polygonOptions: {
                    strokeColor: '#FF8C00',
                    strokeOpacity: 0.8,
                    strokeWeight: 3,
                    fillColor: '#FFA500',
                    fillOpacity: 0.25
                },
                drawingControlOptions: {
                    position: google.maps.ControlPosition.TOP_RIGHT,
                    drawingModes: ['polygon', 'null']
                }

            });

            function valueFn(value) {
                return function() {
                    return value;
                };
            }

            function convertObjectToPathObj(objectlist) {
                var newlist = [];
                objectlist.forEach(function(latlngobj, ind) {
                    newlist.push({
                        "lat": valueFn(latlngobj.lat),
                        "lng": valueFn(latlngobj.lng)
                    });
                });
                return newlist;
            }
            var encodedBaseMesh, heading;

            function generate(data) {

                MC.generateFields(data)
                    .then(function(response) {
                        if (!!response.fields[0].error) {
                            var path = response.fields[0].error;
                            //path.push(path[0]);
                            console.log(path);
                            alert("Maximum waypoint count exceeded.");
                            $scope.infoWindow.close();
                            return;
                        } else {
                            var path = response.fields[0].baseMesh;
                            path.push(path[0]);
                            console.log(path);
                        }
                        var polygon = new google.maps.Data.Polygon([path]);
                        //polygon.setOptions({fillColor: '#FFA500', fillOpacity: 0});
                        $scope.map.data.add({
                            geometry: polygon
                        });
                        var lats = [],
                            lngs = [];
                        var baselatlon = path;
                        var baseMesh = convertObjectToPathObj(baselatlon);
                        encodedBaseMesh = google.maps.geometry.encoding.encodePath(baseMesh);
                        heading = response.fields[0].heading;
                        console.log(encodedBaseMesh);
                        console.log(response.fields[0].heading);
                    });

            }

            var customEncodedBounds, bbox, blockdata;
            google.maps.event.addListener(drawingManager, 'polygoncomplete', function(event) {
                var path = event.getPaths().getAt(0).getArray();
                var area = google.maps.geometry.spherical.computeArea(path) * 0.000247105;
                var bounds = new google.maps.LatLngBounds();
                customEncodedBounds = google.maps.geometry.encoding.encodePath(path);
                var cusBounds = path.map((pt) => ({
                    lat: pt.lat(),
                    lng: pt.lng()
                }));
                var lats = [],
                    lngs = [];
                var i;
                for (i = 0; i < path.length; i++) {
                    bounds.extend(path[i]);
                }
                var center = bounds.getCenter();
                $scope.infoWindow = new google.maps.InfoWindow();


                var optionsStr = "";
                angular.forEach(MC.operations, function(operation, indx) {
                    optionsStr += '<option value=' + operation.opId + ' org=' + operation.org + '>' + operation.farmName + '</option>';
                });
                console.log(MC.operations);
                /* beautify preserve:start */
                var contentString = '<div class="customBlock" class="panel-body custom">' + '<table border="0" class="infoDropdown"><tbody>' + '<tr><td>' + '<select id="getOperationName">' + '<option value="-1">Please select...</option>' + optionsStr + '</select></td></tr>' + '<tr class="customBlockName"><td><input type="text" placeholder="Name"/></td></tr>' + '</tbody></table>' + '<table class="metadata"><tbody><tr><td>Area</td>' + '<td>' + area.toFixed(4) + ' Acres' + '</td>' + '</tr></tbody></table>' + '<div class="add-row-button pull-left col12 padT10">' + '<div class="pill col12">' + '<div class="pill col6">' + '<button class="icon-plus add pull-left col3"> Add property</button>' + '<button class="del col4">Delete</button>' + '</div>' + '<div class=" pull-right">' + '<button class="save col3 save">Save</button>' + '<button class="minor col3">Cancel</button>' + '</div>' + '</div>' + '</div>' + '</div>';
                //console.log(op);
                google.maps.event.addListener($scope.infoWindow, 'domready', function() {
                    var closeBtn, addBtn, saveBtn, delBtn, clr,
                        minlat, maxlat, minlng, maxlng, bbox;
                    blockdata = {};
                    closeBtn = $('.minor').get();
                    addBtn = $('.add').get();
                    saveBtn = $('.save').get();
                    delBtn = $('.del').get();
                    clr = $('.clr-bounds').get();

                    google.maps.event.addDomListener(closeBtn[0], 'click', function() {
                        $scope.infoWindow.close();
                    });
                    google.maps.event.addDomListener(delBtn[0], 'click', function() {
                        $scope.infoWindow.close();
                        event.setMap(null);
                    });
                    google.maps.event.addDomListener(clr[0], 'click', function() {
                        $scope.infoWindow.close();
                        event.setMap(null);
                    });
                    google.maps.event.addDomListener(addBtn[0], 'click', function() {
                        var ele = d3.select('.metadata > tbody');
                        var tr = ele.append('tr');

                        tr.append('td')
                            .append('input')
                            .attr('type', 'text');

                        tr.append('td')
                            .append('input')
                            .attr('type', 'text');
                    });

                    google.maps.event.addDomListener(saveBtn[0], 'click', function() {
                        var cusBlock = $('.metadata').find('tr');
                        var selectedOperationId = $("#getOperationName").val();
                        //var selectedOperationName = $("#getOperationName option:selected").text();
                        var selectedOperationOrg = $("#getOperationName option:selected").attr('org');

                        angular.forEach(cusBlock, function(ele, index) {
                            var key, value;
                            var custds = $(ele).find('td');
                            var cusinp = $(custds).find('input');
                            if (cusinp.length) {
                                key = $.trim($(cusinp[0]).val());
                                value = $.trim($(cusinp[1]).val());
                            } else {
                                return;
                            }
                            if (key) {
                                blockdata[key] = value;
                            }
                        });
                        for (var i = 0; i < cusBounds.length; i++) {
                            lats.push(cusBounds[i].lat);
                            lngs.push(cusBounds[i].lng);
                        }
                        minlat = Math.min.apply(null, lats);
                        maxlat = Math.max.apply(null, lats);
                        minlng = Math.min.apply(null, lngs);
                        maxlng = Math.max.apply(null, lngs);
                        bbox = [minlng, minlat, maxlng, maxlat];
                        var cusBl = $('.infoDropdown').find('tr');
                        var cusName = $(cusBl).find('input');
                        var cusBlockName = $.trim($(cusName).val());
                        var cusBlock = {
                            "org-id": selectedOperationOrg,
                            "op-id": selectedOperationId,
                            "heading": heading,
                            "name": cusBlockName,
                            "bbox": bbox,
                            "properties": blockdata,
                            "boundary": customEncodedBounds,
                            "base-mesh": encodedBaseMesh
                        }
                        console.log(cusBlock);
                        MosaicDataService.createBlockFromGeoJSONFeatures(cusBlock);
                        //createBlockFromGeoJSONFeatures();
                        $scope.infoWindow.close();
                    });
                });

                /* beautify preserve:end */
                $scope.infoWindow.setContent(contentString);
                $scope.infoWindow.setPosition(center);
                $scope.infoWindow.open($scope.map);
                drawingManager.setDrawingMode(null);

                if (area < 300) {
                    generate({
                        farmId: 'abc123',
                        fields: [{
                            fieldName: new Date().toString(),
                            farmId: 'abc123',
                            boundary: path.map((pt) => ({
                                lat: pt.lat(),
                                lng: pt.lng()
                            }))
                        }]

                    });
                } else {
                    event.setMap(null);
                    $scope.infoWindow.close();
                    alert('Please select less than 300 acres!');
                }
            });

            var input = document.getElementById('autocomplete-input');
            var searchBox = new google.maps.places.SearchBox(input);
            $scope.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

            // Bias the SearchBox results towards current map's viewport.
            $scope.map.addListener('bounds_changed', function() {
                searchBox.setBounds($scope.map.getBounds());
            });

            // Listen for the event fired when the user selects a prediction and retrieve
            // more details for that place.
            searchBox.addListener('places_changed', function() {
                var places = searchBox.getPlaces();

                if (places.length === 0) {
                    return;
                }

                // For each place, get the icon, name and location.
                var bounds = new google.maps.LatLngBounds();
                places.forEach(function(place) {
                    if (place.geometry.viewport) {
                        // Only geocodes have viewport.
                        bounds.union(place.geometry.viewport);
                    } else {
                        bounds.extend(place.geometry.location);
                    }
                });
                $(input).val('');
                $(input).blur();
                $scope.map.fitBounds(bounds);
            });

            google.maps.event.addDomListener(window, "resize", handleResize);


            // map.data.loadGeoJson('/static/json/ranches/JulianaD15.geojson');
            // map.data.loadGeoJson('/static/json/ranches/JulianaD16.geojson');
            // map.data.loadGeoJson('/static/json/ranches/JulianaD17.geojson');
            // map.data.loadGeoJson('/static/json/ranches/JulianaFarming.geojson');

            map.data.setStyle({
                visible: true,
                zIndex: 10,
                fillColor: '#3399CC',
                fillOpacity: 0.1,
                strokeColor: '#3399CC'
            });
            initJson();
            var mapIconsIntv = null;
            var handleMapIcons = function() {
                var imgsElms = document.querySelectorAll("img[src$='/mapfiles/drawing.png']");
                var imgLen = imgsElms.length;

                if (imgLen) {
                    if (mapIconsIntv != null) {
                        $interval.cancel(mapIconsIntv);
                    }

                    for (var i = 0; i < imgLen; i++) {
                        imgsElms[i].parentNode.setAttribute("class", "fa controllericon_" + i);
                        angular.element('.fa').parents().eq('2').parent().addClass('toolWrapper');
                        angular.element('#map > div').addClass('zIndex');

                    }

                    angular.element("#map-wrapper").css("visibility", "visible");
                    MC.show = false;
                }
            };

            google.maps.event.addListener(map, 'tilesloaded', function() {
                mapIconsIntv = $interval(handleMapIcons, 500);
            });

        }

        function setOperation(opId) {
            console.log(MC.operations, opId);
            // return;
            var operation = MC.operations[opId];
            $scope.currentOp = operation;
            $scope.detailOperation = operation;
            if (!!operation.bbox)
                MC.setBBox(operation.bbox);
            // var name = operation.op_name;
            // $scope.map.data.setStyle(function(feature){
            //     /** @type {google.maps.Data.StyleOptions} */
            //     var style = ({
            //         visible: true,
            //         zIndex: 10,
            //         fillColor:'#3399CC',
            //         fillOpacity: 0,
            //         strokeColor: '#3399CC'
            //     });
            //     // if (feature.getProperty('RANCH_1') === name){
            //     //     style.visible = true;
            //     //     style.fillColor = '#FFA500';
            //     //     style.strokeColor = '#FFA500';
            //     //     style.fillOpacity = 0;
            //     //     return style;
            //     // }
            //     return style;
            // });
        }

        function setFeature(feature) {
            MC.setBBox(feature.bbox);
        }

        function setBBox(bbox) {
            console.log(bbox);
            var bounds = (
                ([west, south, east, north]) => ({
                    west,
                    south,
                    east,
                    north
                })
            )(bbox);

            $scope.map.fitBounds(bounds);
        }

        function initJson() {
            $scope.infoWindow = new google.maps.InfoWindow();

            $scope.map.data.setStyle({
                visible: false,
                zIndex: 10,
                fillColor: '#3399CC',
                fillOpacity: 0,
                strokeColor: '#3399CC'
            });

            $scope.infoWindow.setZIndex(0);

            $scope.map.data.addListener('click', event => {
                var props = [];

                event.feature.forEachProperty((val, key) => {
                    var prop = {};
                    prop.key = key;
                    prop.val = val ? val : '-';
                    props.push(prop);
                });

                var contentString = '<div id="infoWindowContent" style="max-height:350px;min-width:200px;overflow-y:auto;"></div>';

                $scope.infoWindow.setContent(contentString);
                $scope.infoWindow.setPosition(event.latLng.toJSON());
                $scope.blockData = {
                    data: props
                };
                $scope.infoWindow.open($scope.map);
            });

            $scope.infoWindow.addListener('domready', function() {
                var tpl = '<ng-include src="\'/templates/map.infowindow.partial.html\'" id="infoWindowWrap"></ng-include>';
                $('#infoWindowContent').empty();
                $('#infoWindowContent').append($compile(tpl)($scope));
                $scope.$apply();
                $timeout(function() {
                    $scope.infoWindow.setZIndex(4);
                }, 20, false);
            });

            $scope.infoWindow.addListener('closeclick', function() {
                google.maps.event.clearListeners('domready', $scope.infoWindow);
            });

        }

        function loadTiles(selectedBatch, selectedType) {
            console.log(selectedBatch, selectedType);
            TileService.loadTiles(selectedBatch, selectedType, $scope.map);
        };

        function showFieldPopup(o) {
            return function(event) {
                var area = google.maps.geometry.spherical.computeArea(o.getPath()) * 0.000247105;
                /* beautify preserve:start */
                var contentString = '<h5>' + o.fieldName + '</h5><br>' + '<div class="panel-body" style="width:270px;padding:0px;"><dl class="dl-horizontal" style="width:250px;">' + '<dt style="width:100px;"><b>Clicked location:</b></dt>' + '<dd style="margin-left:120px;">' + '[' + event.latLng.lat().toFixed(6) + ',' + event.latLng.lng().toFixed(6) + ']' + '</dd>' + '<dt style="width:100px;"><b>Area:</b></dt>' + '<dd style="margin-left:120px;">' + area.toFixed(4) + ' Acres' + '</dd></dl>' + '<button type="button" id="deactivator">Deactivate Field</button></div>';
                /* beautify preserve:end */
                $scope.infoWindow.setContent(contentString);
                $scope.infoWindow.setPosition(event.latLng);
                $scope.infoWindow.open($scope.map);
            };
        };



        function confirmField(newfieldname) {
            console.log(newfieldname);
            $scope.fieldInProgress.store(String(newfieldname));
            $scope.savedFields.push($scope.fieldInProgress);
            $scope.fieldInProgress = null;
            $scope.markerId = 0;
            $scope.markers.forEach(function(m) {
                m.setMap(null);
            });
            $scope.markers = [];
            $scope.reset();
        };

        function generateFields(data) {

            //           console.log('fields confirming');
            //           var farmToSubmit = {};
            //           farmToSubmit.farmId = '';//$scope.currentFarm.id;
            //           farmToSubmit.fields = [];
            //           var thePolygons = $scope.savedFields;
            //           thePolygons.forEach(function(p, i) {
            //               var f = {};
            //               f.createdOn = p.createdOn_;
            //               f.fieldName = p.fieldName_;
            //               f.active = true; 
            //               console.log(f.fieldName);
            //               f.boundary = [];
            //               var bound = p.getPath();
            //               bound.forEach(function(b, j) {
            //                   var n = {};
            //                   n.lat = b.lat();
            //                   n.lng = b.lng();
            //                   n.ind = j;
            //                   f.boundary.push(n);
            //               });
            //               farmToSubmit.fields[i] = f;
            //           });
            //            console.log(data);
            //           return $q.when();
            return UserService.generateFields(data);
            //console.log(data.fields[0].boundary);
        };
    };

})();