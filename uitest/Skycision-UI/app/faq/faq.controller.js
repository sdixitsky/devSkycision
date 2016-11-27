(function() {
    angular
        .module('skyApp.faq')
        .controller('faqController', [
            '$scope',
            '$q',
            '$location',
            '$anchorScroll',
            faqController
        ]);


    function faqController($scope, $q, $location, $anchorScroll) {

        $scope.scrollTo = function(id) {            
            $location.hash(id);
            $anchorScroll();
        };

    }


})();
