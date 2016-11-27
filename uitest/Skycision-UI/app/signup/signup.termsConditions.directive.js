(function() {

	angular
		.module('skyApp.signup')
		.directive('termsCond', [terms]);

	function terms() {
		return {
			restrict : 'E',
			templateUrl : 'app/signup/terms.conditions.html'
		}
	}
})();
