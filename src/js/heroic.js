/*jshint eqnull:true */
/*global angular */
(function () {
    var app = angular.module('demoApp');
    app.controller('HeroicController', ['$scope', '$http', function($scope, $http) {
        $scope.columnGroups = [];
        $scope.columns = [];
        $scope.items = [];

        $scope.jsonUrl = 'json/items.json';
        $scope.dataSeqNo = 0;
        $scope.loadData = function () {
            return $http.get($scope.jsonUrl).success(function (data) {
                $scope.columnGroups = data.columnGroups;
                $scope.columns = data.columns;
                $scope.items = data.items;
            }).error(function (data) {
            });
        };

        $scope.init = function () {
            $scope.loadData();
        };

        $scope.init();
    }]);
}());