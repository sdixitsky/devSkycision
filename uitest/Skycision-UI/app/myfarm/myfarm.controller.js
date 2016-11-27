(function() {
    angular
        .module('skyApp.myfarm')
        .controller('myfarmController', myfarmController);

    myfarmController.$inject = ['$scope', '$state', '$rootScope'];

    function myfarmController($scope, $state, $rootScope) {
        $scope.oneAtATime = true;

        // $scope.status = {
        //     isFirstOpen: true,
        //     isFirstDisabled: false
        // };

        $scope.defaultCropLifeOptions = [{
            name: 'Prune',
            id: 'PRUNE'
        }, {
            name: 'Plant',
            id: 'PLANT'
        }, {
            name: 'Harvest',
            id: 'HARVEST'
        }];

        $scope.fields = [{
            "name": "Field 5",
            "acres": "36 acres",
            "crop": "Oranges",
            selectedcroplife: ''
        }, {
            "name": "Field 4",
            "acres": "36 acres",
            "crop": "Oranges",
            selectedcroplife: ''
        }, {
            "name": "Field 3",
            "acres": "34 acres",
            "crop": "Oranges",
            selectedcroplife: ''
        }, {
            "name": "Field 2",
            "acres": "39 acres",
            "crop": "Oranges",
            selectedcroplife: ''
        }, {
            "name": "Field 1",
            "acres": "31 acres",
            "crop": "Oranges",
            selectedcroplife: ''
        }];

        $scope.slider_ticks = {
            value: 0,
            options: {
                ceil: 11,
                floor: 0,
                showTicks: true,
                translate: function(value) {
                    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                    return months[value];
                }
            }
        };
        $scope.saveField = function(fieldObj) {
            //alert(JSON.stringify(fieldObj))
        };
        //Calendar

        $scope.today = function() {
            $scope.dt = new Date();
        };
        $scope.today();

        $scope.clear = function() {
            $scope.dt = null;
        };

        $scope.inlineOptions = {
            customClass: getDayClass,
            minDate: new Date(),
            showWeeks: true
        };

        $scope.dateOptions = {
            //dateDisabled: disabled,
            formatYear: 'yy',
            maxDate: new Date(2020, 5, 22),
            minDate: new Date(),
            startingDay: 1
        };

        $scope.toggleMin = function() {
            $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
            $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
        };

        $scope.toggleMin();

        $scope.open1 = function() {
            $scope.popup1.opened = true;
        };

        $scope.open2 = function() {
            $scope.popup2.opened = true;
        };

        $scope.setDate = function(year, month, day) {
            $scope.dt = new Date(year, month, day);
        };

        $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
        $scope.format = $scope.formats[0];
        $scope.altInputFormats = ['M!/d!/yyyy'];

        $scope.popup1 = {
            opened: false
        };

        $scope.popup2 = {
            opened: false
        };

        var tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        var afterTomorrow = new Date();
        afterTomorrow.setDate(tomorrow.getDate() + 1);
        $scope.events = [{
            date: tomorrow,
            status: 'full'
        }, {
            date: afterTomorrow,
            status: 'partially'
        }];

        function getDayClass(data) {
            var date = data.date,
                mode = data.mode;
            if (mode === 'day') {
                var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

                for (var i = 0; i < $scope.events.length; i++) {
                    var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);

                    if (dayToCheck === currentDay) {
                        return $scope.events[i].status;
                    }
                }
            }

            return '';
        }


    }



})();