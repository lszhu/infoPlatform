'use strict';

angular.module('myApp.directive', [])

    .directive('alertMsg', function() {
        return {
            restrict: 'AE',
            scope: false,
            replace: true,
            templateUrl: '/etcView/clause.html'
        }
    })
    .directive('infoDialog', function() {
        return {
            restrict: 'AE',
            scope: true,
            transclude: true,
            template: '<!--  信息显示框  -->' +
            '<div class="modal fade" id="informationMsg" role="dialog">' +
            '<div class="modal-dialog modal-lg">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<button type="button" class="close" data-dismiss="modal">' +
            '<span aria-hidden="true">&times;</span>' +
            '<span class="sr-only">Close</span></button>' +
            '<h2 class="modal-title text-center">' +

            '<strong>{{information.heading}}</strong></h2></div>' +

            '<div class="modal-body">' +
            '<div class="container">' +

            '<div class="text-center">{{information.reference}}</div>' +

            '<div ng-transclude></div>' +

            '</div></div>' +
            //'<div class="modal-footer"></div>' +
            '</div></div></div>'
        };
    })
    .directive('fileread', [function () {
        return {
            scope: {
                fileread: '='
            },
            link: function(scope, element, attributes) {
                element.bind('change', function (changeEvent) {
                    var reader = new FileReader();
                    reader.onload = function (loadEvent) {
                        scope.$apply(function () {
                            scope.fileread = loadEvent.target.result;
                        });
                    };
                    reader.readAsDataURL(changeEvent.target.files[0]);
                });
            }
        }
    }]);