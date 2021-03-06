var dashboardModule = angular.module('page.dashboard', ['ngCookies', 'service.academic']);

dashboardModule.config(function ($stateProvider, $urlRouterProvider) {

	$stateProvider
		.state('dashboard', {
			url: '/dashboard',
			controller: 'dashboardCtrl',
			templateUrl: '../../partials/dashboard.html'
		})
});

/**
 * Dashboard Page
 * @param $scope
 * @param $state
 * @param $course
 * @param userService
 */
function dashboardCtrlFunc($scope, $state, $course, userService) {

	var user = userService.getUser();
	if (!user) {
		$state.go('home');
		return;
	}

	$scope.finishedCourses = [];
	$scope.ongoingCourses = [];

	/**
	 * Query course subscriptions
	 */
	$course.subscriptions(user.id, null, null, 100, "descending").then(function (response) {
		if (response.status >= 400) {
			return;
		}

		$scope.ongoingCourses = response.data.filter(c => !c.completed);
		$scope.finishedCourses = response.data.filter(c => c.completed);
	});
}

dashboardModule.controller('dashboardCtrl', ['$scope', '$state', '$course', 'userService', function ($scope, $state, $course, userService) {

	if ($scope.authReady) {
		dashboardCtrlFunc($scope, $state, $course, userService);
		return;
	}

	$scope.$on("auth:ready", _ => dashboardCtrlFunc($scope, $state, $course, userService));

}]);
