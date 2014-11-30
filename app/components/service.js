'use strict';

angular.module('myApp.service', [])

    .factory('job', ['$http', function($http) {
        var job = {};
        $http.get('/jobService')
            .success(function(res) {
                if (res.status == 'ok') {
                    var tmp = res.jobList;
                    tmp.sort(function(a, b) {
                        var index = a.date - b.date;
                        if (index < 0) {
                            return 1
                        } else if (index == 0) {
                            return 0;
                        } else {
                            return -1;
                        }
                    });
                    job.list = tmp;
                }
            })
            .error(function(err) {
                console.log('无法获取招聘信息，错误原因：%o', err);
                job.list = [];
            });
        return job;
    }]);