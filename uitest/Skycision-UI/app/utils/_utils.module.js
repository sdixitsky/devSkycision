(function() {
    var utilsModule = angular.module('skyApp.utils', []);

    utilsModule.directive('sideNavSlide', sideNavSlideDirective);

    function sideNavSlideDirective() {
        var controller = function($scope) {
            $scope.toggleSlideNavBar = function() {
                $scope.openNav = !$scope.openNav;
            }
        };

        return {
            restrict: "E",
            controller: ['$scope', controller],
            link: function($scope, element, attrs) {
                $scope.openNav = attrs.defaultNavStatus || true;
            },
            transclude: true,
            templateUrl: "templates/sideNavSlide.html"
        }
    }

})();