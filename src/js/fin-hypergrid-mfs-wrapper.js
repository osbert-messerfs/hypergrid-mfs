/*jshint eqnull:true */
/*global angular */
(function () {
    var app = angular.module('mfsHypergrid', []);
    app.directive('mfsHypergridWrapper', [function () {
        return {
            scope: {
                data: '=data'
            },
            restrict: 'AE',
            template: '<fin-hypergrid><fin-hypergrid-behavior-mfs></fin-hypergrid-behavior-mfs></fin-hypergrid>',
            link: function (scope, element, attrs) {

                scope.setData = function () {
                    var finHypergrid = element.find("fin-hypergrid");
                    /*jshint -W030 */
                    if (finHypergrid.length) {
                        if (finHypergrid[0].getBehavior){
                            if (finHypergrid[0].getBehavior().setData) {
                                var rawData = scope.data;
                                finHypergrid[0].getBehavior().setData(rawData);
                            }
                        }
                    }
                    /*jshint +W030 */
                };

                scope.$watch('data', function (newVal, oldVal) {
                    scope.setData();
                });
                scope.$watch(function () {
                    var finHypergrid = element.children("fin-hypergrid");
                    if (finHypergrid.length === 0) {
                        return null;
                    }
                    if (!finHypergrid[0].getBehavior) {
                        return null;
                    }
                    return finHypergrid[0].getBehavior().getData();
                }, function (newVal, oldVal) {
                    data = newVal;
                });
            }
        };
    }]);

}());