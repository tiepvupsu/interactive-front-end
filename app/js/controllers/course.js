var courseModule = angular.module('page.course', ['duScroll', 'service.academic', 'service.user']);

courseModule.config(function ($stateProvider, $urlRouterProvider) {

	$stateProvider
		.state('course', {
			url: '/course/:courseId',
			templateUrl: '../../partials/course/course.html'
		})
		.state('course.introduction', {
			url: '/intro',
			controller: 'courseIntroductionCtrl',
			templateUrl: '../../partials/course/introduction.html'
		})
		.state('course.home', {
			url: '/detail',
			controller: 'courseHomePageCtrl',
			templateUrl: '../../partials/course/courseHomePage.html'
		});
});

courseModule.controller('courseIntroductionCtrl', [
	'$scope',
	'$stateParams',
	'$state',
	'$course',
	'userService', function ($scope, $stateParams, $state, $course, userService) {

		function loadReviews() {
			$course.reviews($stateParams.courseId).then(res => {
				$scope.reviews = res.data;
			});
		}

		$scope.course = null;
		$scope.author = null;
		$scope.reviews = [];
		$scope.enrolling = false;
		$scope.lessons = [];
		$scope.registration = null;

		$scope.review_onSubmit = function () {
			if (!$scope.reviewScore || !$scope.reviewTitle) {
				return;
			}

			$course.postReview($stateParams.courseId, $scope.reviewTitle, $scope.review, $scope.reviewScore).then(r => {
				$scope.reviewScore = undefined;
				$scope.review = null;
				$scope.reviewTitle = null;
				loadReviews();
			});
		}

		$scope.onEnrollClick = function () {
			if (user == null) {
				$state.go('registration');
				return;
			}

			if (!$scope.registration) {
				$course.register(user.id, $scope.course.id);
			}

			$state.go('course.home', { courseId: $scope.course.id });
		}

		var user = userService.getUser();

		$course.get($stateParams.courseId).then(res => {
			$scope.course = res.data;
		}, err => {
		}).then(_ => {
			userService.author($scope.course.authorId).then(r => {
				$scope.author = r.data;
			}, errA => {

			});

			if (!user || !$scope.course) {
				return;
			}

			$course.registration(user.id, $scope.course.id).then(r => {
				$scope.registration = !r.data ? null : r.data;
			});
		});

		$course.lessons($stateParams.courseId).then(res => {
			$scope.lessons = res.data;
		});

		loadReviews();

	}]);

function courseHomePageCtrlFunc($q, $scope, $state, $stateParams, userService, $course) {
	var user = userService.getUser();
	if (!user) {
		$state.go('registration');
		return;
	}

	$scope.lessons = [];
	$scope.course = null;
	var progress = null;
	var lessons = [];

	function init() {
		var defer = $q.defer();

		var progressPromise = $course.progress(user.id, $stateParams.courseId).then(res => {
			progress = res.data;
		}, errC => defer.reject(errC));

		var lessonPromise = $course.lessons($stateParams.courseId).then(res => {
			lessons = res.data;
		}, errL => defer.reject(errL));

		$q.all([progressPromise, lessonPromise]).then(_ => {
			defer.resolve();
		});

		return defer.promise;
	}

	init().then(_ => {
		if (!lessons || lessons.length == 0) { return; }
		if (!progress) { progress = {}; }

		for (var i = 0; i < lessons.length; i++) {
			if (progress[lessons[i].id] === null || progress[lessons[i].id] === undefined) {
				continue;
			}

			lessons[i].progress = Math.round(progress[lessons[i].id] * 100);
		}

		$scope.lessons = lessons;
	});

	$course.get($stateParams.courseId).then(res => {
		$scope.course = res.data;
	});
}

courseModule.controller('courseHomePageCtrl', [
	'$q',
	'$scope',
	'$state',
	'$stateParams',
	'userService',
	'$course', function ($q, $scope, $state, $stateParams, userService, $course) {

		if ($scope.authReady) {
			courseHomePageCtrlFunc($q, $scope, $state, $stateParams, userService, $course);
			return;
		}

		$scope.$on("auth:ready", _ => courseHomePageCtrlFunc($q, $scope, $state, $stateParams, userService, $course));
	}]);
