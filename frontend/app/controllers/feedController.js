(function(){

var cont = angular.module('poll-princeton.controllers');

cont.controller('feedController', function ($scope, $filter, $http, $location) {
  $scope.fetchedDevs = false;
  $scope.devs = [];
  $scope.fetchedPolls = false;
  $scope.polls = [];
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  $scope.fetchDevs = function () {
    $http.get('http://' + window.location.hostname + '/ppapi/devs').success(function (data, status, headers, config) {
      $scope.devs = data;
      $scope.fetchedDevs = true;
    });
  };

  $scope.deletePolls = function () {
    $http.get('http://' + window.location.hostname + '/ppapi/polls/delete/all').success(function (data, status, headers, config) {
    });
  };

  $scope.fetchAllPolls = function () {
    $http.get('http://' + window.location.hostname + '/ppapi/polls/get/all').success(function (data, status, headers, config) {
      $scope.polls = data;
      for (var i in $scope.polls) {
        var thisPoll = $scope.polls[i];
        var date = new Date(thisPoll.time);
        thisPoll.humanTime = months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
      }
      $scope.fetchedPolls = true;
    });
  };

  //async?
  $scope.fetchAllPolls();



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
