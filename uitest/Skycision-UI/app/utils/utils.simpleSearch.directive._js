(function(){
    angular.module('skyApp.utils')
        .filter('simpleSearch', SimpleSearch);

    function SimpleSearch() {
        return function(arr, searchString){
            console.log(arr,searchString);
            if(!searchString){
                return arr;
            }
            var result = [];
            searchString = searchString.toLowerCase();
            angular.forEach(arr, function(item){
                if(item.toLowerCase().indexOf(searchString) !== -1){
                result.push(item);
            }
            });
            return result;
        };
    }
})();