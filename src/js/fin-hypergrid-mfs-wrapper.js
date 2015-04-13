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

                    // Default mfs cell Provider
                    var behavior = element.find("fin-hypergrid")[0].getBehavior();
                    var cellProvider = element.find("fin-hypergrid")[0].getBehavior().getCellProvider();
                    cellProvider.getCell = function(config) {
                        var renderer = cellProvider.cellCache.simpleCellRenderer;
                        config.halign = 'left';
                        var x = config.x;
                        if (behavior && behavior.columns && behavior.columns.length && behavior.columns[x]) {
                            var column = behavior.columns[x];
                            if (column.type === 'numeric') {
                                config.halign = 'right';
                                if (numeral().unformat(config.value) < 0) {
                                    config.fgColor = '#ff0000';
                                }
                            }
                            if (column.format === '#,###') {
                                config.value = numeral(config.value).format('0,0');
                            }
                            if (column.format === '#,###.00') {
                                config.value = numeral(config.value).format('0,0.00');
                            }
                        }
                        if (config.value == null) {
                            config.value = '';
                        }
                        renderer.config = config;
                        return renderer;
                    };
                });
            }            
        };
    }]);

}());