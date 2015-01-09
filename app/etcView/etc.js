'use strict';

angular.module('myApp.etc', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/etc/introduction', {
                templateUrl: 'etcView/introduction.html',
                controller: 'IntroductionCtrl'
            })
            .when('/etc/suggestion', {
                templateUrl: 'etcView/suggestion.html',
                controller: 'SuggestionCtrl'
            })
            .when('/etc/clause', {
                templateUrl: 'etcView/clause.html',
                controller: 'EtcCtrl'
            })
            .when('/etc/help', {
                templateUrl: 'etcView/help.html',
                controller: 'EtcCtrl'
            })
            .when('/etc/about', {
                templateUrl: 'etcView/about.html',
                controller: 'EtcCtrl'
            });
    }])

    .controller('IntroductionCtrl', ['$scope', '$http', '$document',
        function($scope, $http, $document) {
            // 初始化企业信息
            $scope.employer = {};

            // 信息上传函数
            $scope.postMsg = function() {
                $scope.employer.introduction =
                    $document.find('.note-editable').html();
                console.log('employer: %o', $scope.employer.picture);
                $scope.employer.districtId = $scope.districtId;
                $http.post('/postOrgInfo', {employer: $scope.employer})
                    .success(function(res) {
                        if (res.status == 'ok') {
                            alert('您成功发布了企业介绍信息！');
                        } else {
                            alert('信息发布失败，原因是：' + res.message);
                        }
                    })
                    .error(function(err) {
                        alert('信息发布失败，原因是：' + err);
                    });
                postPicture();
            };

            $scope.postDisabled = function() {
                //return false;
                var name = $scope.employer.name;
                var code = $scope.employer.code;
                var phone = $scope.employer.phone;
                //var picture = $scope.employer.picture;
                var address = $scope.employer.address;
                var overview = $scope.employer.overview;
                return !name || !code || !phone || !address || !overview;
            };

            $scope.test = postPicture;
            function postPicture() {
                var frame = $document.find('iframe')[0];
                //var frame = angular.element('#fileUpload').contents();
                if (!frame) {
                    console.log('找不到要提交的图片');
                    return;
                }
                frame = frame.contentDocument || frame.contentWindow.document;
                console.log(frame);
                var code = frame.getElementById('code');
                console.log(code);
                var format = frame.getElementById('format');
                var picture = frame.getElementById('picture');
                format.value = picture.value.split('.').slice(-1)[0];
                code.value = $scope.employer.code;
                frame.getElementById('submit').click();
            }
        }
    ])

    .controller('SuggestionCtrl', ['$scope', '$http', '$document',
        function($scope, $http, $document) {
            // 初始化投诉建议信息
            $scope.suggestion = {};

            // 信息上传函数
            $scope.postMsg = function() {
                $scope.suggestion.suggestion =
                    $document.find('.note-editable').html();
                console.log('districtId: %s', $scope.districtId);
                $scope.suggestion.districtId = $scope.districtId;
                $http.post('/postSuggestion', {suggestion: $scope.suggestion})
                    .success(function(res) {
                        if (res.status == 'ok') {
                            alert('您成功提交了投诉建议信息！');
                            $scope.suggestion = {};
                        } else {
                            alert('信息提交失败，原因是：' + res.message);
                        }
                    })
                    .error(function(err) {
                        alert('信息提交失败，原因是：' + err);
                    });
            };

            $scope.postDisabled = function() {
                var name = $scope.suggestion.name;
                var idNumber = $scope.suggestion.idNumber;
                var phone = $scope.suggestion.phone;
                return !name || !idNumber || !phone;
            };

        }
    ])

    .controller('EtcCtrl', ['$scope', '$http', '$document',
        function($scope, $http, $document) {
            $scope.showContents = function() {
                //console.log($window);
                var c = $document.find('.note-editable').html();
                console.log(c);
            }
        }
    ]);