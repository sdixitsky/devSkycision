(function() {
    angular
        .module('skyApp.root')
        .constant('jQuery', window.jQuery)
        .controller('NavController', [
            '$scope',
            'MosaicDataService',
            'jQuery',
            'org',
            '$mdSidenav',
            '$mdDialog',
            '$mdMedia',
            NavController
        ]);

    function NavController($scope, MDS, $, org, $mdSidenav, $mdDialog, $mdMedia) {
        var NC = this;

        NC.activate = activate;
        NC.activate();

        function activate() {
            $scope.org = org;
            MDS.getOperations(org.orgId).then(operations => {
                //console.log(operations.map(function (arg){return arg.opId}));
                $scope.ops = operations;
            });
        }
        var mainContent = $('.cd-main-content'),
            header = $('.cd-main-header'),
            sidebar = $('.cd-side-nav'),
            mblTabs = $('.nav-tabs'),
            sidebarTrigger = $('.cd-nav-trigger'),
            topNavigation = $('.cd-top-nav'),
            searchForm = $('.cd-search'),
            accountInfo = $('.account'),
            headerHeight = $('.cd-main-header').height();


        $('.has-children > a').on('click', function(event) {
            var selectedItem = $(this);
            // event.preventDefault();
            $('.fa-chevron-down').removeClass('fa-chevron-down');
            if (selectedItem.parent('li').hasClass('selected')) {
                selectedItem.parent('li').removeClass('selected');
            } else {
                sidebar.find('.has-children.selected ').removeClass('selected');
                accountInfo.removeClass('selected');
                selectedItem.parent('li').addClass('selected');
                selectedItem.find('.fa-chevron-right').addClass('fa-chevron-down');
            }
        });
        $scope.showAdvanced = function(ev) {
            // var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
            $mdDialog.show({
                controller: ["$scope", "$mdDialog", DialogController],
                templateUrl: 'templates/users.create-farm.view.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                //fullscreen: useFullScreen
            })
            //     .then(function(answer) {
            //         $scope.status = 'You said the information was "' + answer + '".';
            //     }, function() {
            //         $scope.status = 'You cancelled the dialog.';
            //     });
            // $scope.$watch(function() {
            //     return $mdMedia('xs') || $mdMedia('sm');
            // }, function(wantsFullScreen) {
            //     $scope.customFullscreen = (wantsFullScreen === true);
            // });
        };

        function DialogController($scope, $mdDialog) {

            $scope.cancel = function() {
                $mdDialog.cancel();
            };
        }
    }

})();