(function(){

var cont = angular.module('poll-princeton.controllers');

cont.controller('feedController', function ($scope, $filter, $http, $location) {
  $scope.fetchedDevs = false;
  $scope.devs = [];

  $scope.fetchDevs = function () {
    $http.get('http://' + window.location.hostname + '/ppapi/devs').success(function (data, status, headers, config) {
      $scope.devs = data;
      $scope.fetchedDevs = true;
    });
  };

  /*$scope.showComposeFlyout = function () {
    $('html').css('overflow', 'hidden');
    $('.flyout-compose').fadeIn('fast');
    $('.flyout-compose-contents').show('fast');
  };
  $scope.hideComposeFlyout = function () {
    $('.flyout-compose').fadeOut('fast');
    $('.flyout-compose-contents').hide('fast');
    $('html').css('overflow', 'auto');
  };*/
});

})();
