(function() {

angular
    .module('skyApp.mosaic')
    .component('mapComponent', {
        template: '<div id="map"></div>',
        transclude: true,
        controller: MosaicController,
        bindings: {
            detailOperation: '<',
            mapSource: '&',
            // map: '=?',
            changeDrawMode: '&'
        }
    });

MosaicController.$inject = ['$scope','$http','$q'];
function MosaicController($scope, $http, $q) {
    var ctrl = this;
    ctrl.loadTiles = loadTiles;

    ctrl.$onInit = function() {
        ctrl.mapSource().then( theMap => { ctrl.map = theMap } );
    }

    ctrl.$onChanges = function($changes) {
        console.log($changes);
        if (!!$changes.detailOperation) {
            var newDO = $changes.detailOperation;
            if (!!newDO.currentValue && !!newDO.isFirstChange()) {
                ctrl.loadTiles(newDO.op_id);
            }
        }
    }
    // $scope.$watch('detailOperation', function(newVal, oldVal) {
    //     console.log(newVal, oldVal);
    //     if (!!newVal){
    //         if (!!!ctrl.operation || newVal !== ctrl.operation) {
    //             ctrl.loadTiles(newVal.op_id);
    //         }
    //     } 
    // })

    function loadTiles(id) {
        console.log(id);
        $http({
            method: 'GET',
            url: '/map/gray/tilemapresource.json'
        })
        .then( response => {
            console.log(response.data);
        });
    }

    function loadStandardMap() {
        ctrl.setMap().then( map => {
            console.log(map);
            var imageMapType = new google.maps.ImageMapType({
                getTileUrl: function(coord, zoom) {
                    if (zoom < 17 || zoom > 20 ||
                        bounds[zoom][0][0] > coord.x || coord.x > bounds[zoom][0][1] ||
                        bounds[zoom][1][0] > coord.y || coord.y > bounds[zoom][1][1]) {
                        return null;
                    }

                    return `//kml-skycision-com.s3.amazonaws.com/06032016/${zoom}/${coord.x}/${coord.y}.png`
                },
                tileSize: new google.maps.Size(256, 256)
            });

            ctrl.map.overlayMapTypes.push(imageMapType);
        });
    }


    function onInit() {
        ctrl.setMap().then( map => {
            console.log('$onInit');

            // loadTiles();

            var map = ctrl.map;

            var mapMinZoom = 16;
            var mapMaxZoom = 20;
            var mapBounds = new google.maps.LatLngBounds(
                new google.maps.LatLng(38.21452332, -122.34497517),
                new google.maps.LatLng(38.21863355, -122.34212121)
            );

            var TILE_SIZE = 256;
            function ClipMapType(bounds, map) {
                this.conv = p => [p.lat(),p.lng()];
                
                this.tileSize = new google.maps.Size(256, 256);
                this.rectangle = new google.maps.Rectangle({
                    bounds: bounds,
                    strokeColor: '#7F7F7FF',
                    strokeOpacity: 0,
                    fillOpacity: 0,
                    // editable: true,
                    // draggable: true,
                    map: map,
                });
                this.map = ctrl.map;
            }

            

            // The mapping between latitude, longitude and pixels is defined by the web
            // mercator projection.
            function project(latLng) {
                var siny = Math.sin(latLng.lat() * Math.PI / 180);

                // Truncating to 0.9999 effectively limits latitude to 89.189. This is
                // about a third of a tile past the edge of the world tile.
                siny = Math.min(Math.max(siny, -0.9999), 0.9999);

                return new google.maps.Point(
                    TILE_SIZE * (0.5 + latLng.lng() / 360),
                    TILE_SIZE * (0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI))
                );
            }


            ClipMapType.prototype.getTile = function(coord, zoom, ownerDocument) {
                var self = this;
                var map = this.map;
                this.drawn = false;
                var proj = this.map.getProjection();
                var z2 = Math.pow(2, zoom);
                self.zoom = z2;
                var tileXSize = 256 / z2;
                var tileYSize = 256 / z2;
                var tileBounds = new google.maps.LatLngBounds(
                    proj.fromPointToLatLng(new google.maps.Point(coord.x * tileXSize, (coord.y + 1) * tileYSize)),
                    proj.fromPointToLatLng(new google.maps.Point((coord.x + 1) * tileXSize, coord.y * tileYSize))
                );
                if (!mapBounds.intersects(tileBounds) || zoom < mapMinZoom || zoom > mapMaxZoom) return ownerDocument.createElement('div');
                
                // Your url pattern below
                var url = getCustomTileUrl(coord, zoom, proj);
                var image = new Image();
                
                console.log(url);
                var canvas = ownerDocument.createElement('canvas');
                canvas.width = this.tileSize.width;
                canvas.height = this.tileSize.height;
                var context = canvas.getContext('2d');
                context.save();
                var xdif = coord.x * this.tileSize.width;
                var ydif = coord.y * this.tileSize.height;

                var rectangle = this.rectangle;
                var that = this;

                var scale = [
                    [158, 1, 66],
                    [213, 62, 79],
                    [244, 109, 67],
                    [253, 174, 97],
                    [254, 224, 139],
                    [255, 255, 191],
                    [230, 245, 152],
                    [171, 221, 164],
                    [102, 194, 165],
                    [50, 136, 189],
                    [94, 79, 162]
                ];

                image.onload = function() {

                    var dims = getRectDims(rectangle.getBounds(),self.zoom);
                    // var context = obj.context;
                    
                    context.restore();
                    context.save();
                    context.clearRect(0,0,canvas.width,canvas.height);
                    context.beginPath();
                    context.rect(...dims);
                    context.clip();
                    context.drawImage(image, 0, 0);
                    that.imageData = context.getImageData(0,0,canvas.width,canvas.height);
                    var pixels = that.imageData.data;
                    context.clearRect(0,0,canvas.width,canvas.height);
                    var length = pixels.length;
                    var i, c;
                    for (i = 0; i<length; i++) {

                        c = scale[Math.floor(pixels[i*4] / 255.1 * 12)] || [undefined, undefined, undefined];
                        pixels[i*4] = c[0];
                        pixels[i*4+1] =c[1];
                        pixels[i*4+2] = c[2];
                    }
                    context.putImageData(that.imageData, 0, 0);

                    context.closePath();
                }
                
                


                image.src = url;

                function getRedraw(obj) {

                    if (Date.now()%100 <= 20 || !obj.drawn) {
                        obj.drawn = true;
                        return function redrawRectangle() {
                            var r = obj.rectangle;
                            var dims = getRectDims(r.getBounds(),obj.zoom);
                            // var context = obj.context;
                            
                            context.restore();
                            context.save();
                            context.clearRect(0,0,canvas.width,canvas.height);
                            context.beginPath();
                            context.rect(...dims);
                            context.clip();
                            context.putImageData(obj.imageData, 0, 0);
                            // var imageData = context.getImageData(0,0,canvas.width,canvas.height);
                            // var pixels = imageData.data;
                            // context.clearRect(0,0,canvas.width,canvas.height);
                            // var length = pixels.length;
                            // var i;
                            // for (i = 0; i<length; i++) {
                            //     var gray = pixels[i*4];
                            //     pixels[i*4] = Math.max(0,gray-50);
                            //     pixels[i*4+1] = Math.max(0,gray-50);
                            // }
                            // context.putImageData(imageData, 0, 0);
                            context.closePath();
                        };
                    } else {
                        return angular.noop
                    }
                    
                }
                

                google.maps.event.addListener(this.rectangle, 'bounds_changed', getRedraw(self));

                function getRectDims(bounds, zoom) {

                    var sw = bounds.getSouthWest();
                    var ne = bounds.getNorthEast();

                    var worldSW = project(sw);
                    var worldNE = project(ne);

                    var BL = new google.maps.Point(
                        Math.floor(worldSW.x * zoom),
                        Math.floor(worldSW.y * zoom)
                    );

                    var TR = new google.maps.Point(
                        Math.floor(worldNE.x * zoom),
                        Math.floor(worldNE.y * zoom)
                    );

                    var w = Math.abs(TR.x-BL.x);
                    var h = Math.abs(TR.y-BL.y);
                    return [BL.x-xdif,TR.y-ydif,w,h];
                }

                return canvas;
            };

            function getCustomTileUrl(coord, zoom) {
                return `/map/gray/${zoom}/${coord.x}/${coord.y}.png`;
            }
        })

        // https://developers.google.com/maps/documentation/javascript/examples/maptype-image-overlay
        // var imageMapType = new google.maps.ImageMapType({
        //     : ,
        //     // projection: ctrl.map.getProjection
        //     tileSize: new google.maps.Size(256, 256),
        //     minZoom: mapMinZoom,
        //     maxZoom: mapMaxZoom,
        //     name: 'Tiles',
        //     alt: 'uniquestring',
        //     zIndex:-100,
        // });
        // console.log('map',ctrl.map);
        // console.log('layer',imageMapType);
        // map.overlayMapTypes.push(new ClipMapType(mapBounds, map));
    }
}

})();