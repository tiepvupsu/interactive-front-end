var courseServiceModule = angular.module('service.course', []);

courseServiceModule.factory('courseService', function ($http, $q, settings) {

    return {
        getRecentCourses: function (before, after, limit, sort) {
            return $http.get(settings.apiUrl + '/course', {
                params: {
                    before: before,
                    after: after,
                    limit: limit,
                    sort: sort
                }
            });
        }
    }
});
