/*jshint eqnull:true */
/*global angular */
(function () {
    var app = angular.module('demoApp');
    app.controller('HeroicController', ['$scope', function($scope) {
        $scope.data = [];
        for (var i = 0; i < 1000000; i++) {
            $scope.data.push({
                'column_1' : 'haha' + i,
                'column_2' : Math.random() * 1000,
                'column_3' : Math.random() * 1000,
                'column_4' : Math.random() * 1000,
                'column_5' : Math.random() * 1000,
                'column_6' : Math.random() * 1000,
                'column_7' : Math.random() * 1000,
                'column_8' : Math.random() * 1000,
                'column_9' : Math.random() * 1000,
                'column_10' : Math.random() * 1000,
                'column_11' : Math.random() * 1000,
                'column_12' : Math.random() * 1000,
                'column_13' : new Date()
            });
        }
        console.log("done generating data");
    }]);
}());