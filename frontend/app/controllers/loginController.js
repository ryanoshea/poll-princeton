(function(){

var cont = angular.module('poll-princeton.controllers');

cont.controller('loginController', function ($scope, $filter, $http, $location) {

  /* Handle older browsers without good window.location support */
  if (window.location.hostname == null) {
    $scope.hostname = 'pollprinceton.com';
    $scope.rootUrl = 'http://pollprinceton.com/'
  }
  else {
    $scope.hostname = window.location.hostname;
    $scope.rootUrl = 'http://' + window.location.hostname + window.location.pathname;
  }

  $scope.casReturnUrl = $scope.rootUrl + '#/feed';

  $('body').css('padding-top', '0');

});

})();
