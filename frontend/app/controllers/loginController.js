(function(){

var cont = angular.module('poll-princeton.controllers');

cont.controller('loginController', function ($scope, $filter, $http, $location) {

  $scope.casReturnUrl = window.location.origin + window.location.pathname + '#/feed';;

});

})();
