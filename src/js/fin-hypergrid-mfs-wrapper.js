/*jshint eqnull:true */
/*global angular */
(function () {
    var app = angular.module('mfsHypergrid', []);
    app.directive('mfsHypergridWrapper', [function () {
        return {
            scope: {
                columnGroups: '=columnGroups',
                columns: '=columns',
                data: '=data'
            },
            restrict: 'AE',
            template: '<fin-hypergrid><fin-hypergrid-behavior-mfs></fin-hypergrid-behavior-mfs></fin-hypergrid>',
            link: function (scope, element, attrs) {

                scope.setData = function () {
                    var finHypergrid = element.find("fin-hypergrid");
                    if (finHypergrid.length &&
                       finHypergrid[0].getBehavior &&
                       finHypergrid[0].getBehavior().setData) {
                        finHypergrid[0].getBehavior().setData(scope.data);
                    }
                };

                scope.setColumns = function () {
                    var finHypergrid = element.find("fin-hypergrid");
                    if (finHypergrid.length &&
                       finHypergrid[0].getBehavior &&
                       finHypergrid[0].getBehavior().setColumns) {
                        finHypergrid[0].getBehavior().setColumns(scope.columns);
                    }
                };

                scope.$watch('data', function (newVal, oldVal) {
                    scope.setData();
                });

                scope.$watch('columns', function (newVal, oldVal) {
                    scope.setColumns();
                });

                scope.$watch(function () {
                    var finHypergrid = element.children("fin-hypergrid");
                    if (finHypergrid.length === 0) {
                        return null;
                    }
                    if (!finHypergrid[0].getBehavior) {
                        return null;
                    }
                    if (!finHypergrid[0].getBehavior().getData) {
                        return null;
                    }
                    return finHypergrid[0].getBehavior().getData();
                }, function (newVal, oldVal) {
                    scope.data = newVal;
                });

                document.addEventListener('load', function() { // load event from domReady function in fin-hypergrid
                    var lnfOverrides = {
                        scrollbarHoverOver: 'visible',
                        scrollbarHoverOff: 'visible',
                        scrollingEnabled: true
                    };
                    element.find("fin-hypergrid")[0].addProperties(lnfOverrides);
                });
            }            
        };
    }]);

}());