(function() {
    angular
        .module('skyApp.utils')
        .directive('ngMaterialLoader', [ngMaterialLoaderFunc]);


    function ngMaterialLoaderFunc() {

        return {
            restrict: 'EA',
            template: '<md-progress-circular class="md-accent loading-icon-align" md-mode="indeterminate" ng-show="show" md-diameter="100"></md-progress-circular>',
            scope: {
                show: "="
            },
            link: function(scope, ele, attrs) {
                scope.$watch("show", function(newval, oldval) {
                    if (newval != oldval) {
                        scope.show = !!newval;
                    }
                });
            }
        };
    };

})();