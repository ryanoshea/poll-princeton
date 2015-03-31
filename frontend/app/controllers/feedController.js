(function(){

var cont = angular.module('poll-princeton.controllers');

cont.controller('feedController', function ($scope, $filter, $http, $location) {
  $scope.fetchedDevs = false;
  $scope.devs = [];
  $scope.fetchedPolls = false;
  $scope.polls = [];
  $scope.fetchedChoicess = false;


  $scope.fetchDevs = function () {
    $http.get('http://' + window.location.hostname + '/ppapi/devs').success(function (data, status, headers, config) {
      $scope.devs = data;
      $scope.fetchedDevs = true;
    });
  };

  $scope.deletePolls = function () {
    $http.get('http://' + window.location.hostname + '/ppapi/deletePolls').success(function (data, status, headers, config) {
    });
  };

  $scope.fetchPolls = function () {
    $http.get('http://' + window.location.hostname + '/ppapi/getAllPolls').success(function (data, status, headers, config) {
      $scope.polls = data;
      $scope.fetchedPolls = true;
    });
  };

  $scope.getChoices = function () {
    choices = [];
    for (p in $scope.polls) {
      for (c in p.choices) {
        $scope.choices.push(c);
      }
    }
    $scope.fetchedChoices = true;
    return choices;
  };


  //async? 
  $scope.polls = $scope.fetchPolls();



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
