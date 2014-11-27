'use strict';

angular.module('myApp.service', [])

    .factory('job', ['$http', function($http) {
        var job = {};
        $http.get('/jobService')
            .success(function(res) {
                if (res.status == 'ok') {
                    job.list = res.jobList;
                }
            })
            .error(function(err) {
                console.log('无法获取招聘信息，错误原因：%o', err);
                job.list = [];
            });
        return job;
    }]);