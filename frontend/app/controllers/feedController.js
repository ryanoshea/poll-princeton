(function(){

var cont = angular.module('poll-princeton.controllers');

cont.controller('feedController', function ($scope, $filter, $http, $location) {

  document.title = 'Feed | PollPrinceton'

  $('body').css('padding-top', '50px');

  $scope.fetchedDevs = false;
  $scope.devs = [];
  $scope.fetchedPolls = false;
  $scope.polls = [];
  $scope.currentPolls = 0;
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

  $scope.fetch10Best = function () {
    var user = localStorage.getItem('netid');
    $http.get('http://' + window.location.hostname + '/ppapi/polls/get/popular/' + user + '/' + $scope.currentPolls).success(function (data, status, headers, config) {
      $scope.polls = data;
      $scope.currentPolls = $scope.currentPolls + 10; 
      for (var i in $scope.polls) {
        var thisPoll = $scope.polls[i].pollData;
        var date = new Date(thisPoll.time);
        thisPoll.humanTime = months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
      }
      $scope.fetchedPolls = true;
    });
  };

  $scope.fetch10New = function () {
    var user = localStorage.getItem('netid');
    $http.get('http://' + window.location.hostname + '/ppapi/polls/get/newest/' + user + '/' + $scope.currentPolls).success(function (data, status, headers, config) {
      $scope.polls = data;
      $scope.currentPolls = $scope.currentPolls + 10; 
      for (var i in $scope.polls) {
        var thisPoll = $scope.polls[i].pollData;
        var date = new Date(thisPoll.time);
        thisPoll.humanTime = months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
      }
      $scope.fetchedPolls = true;
    });
  };

  /*$scope.upVote = function (pid) {
    $http.post('/ppapi/polls/vote', )
      .success(function (data, status, headers, config) {
        //Update the number displayed for the poll. Color the arrow.
      })
      .error(function (data, status, headers, config) {
        alert('Something went wrong. Please try to submit again in a few moments.')
        $('.vote-submit').attr('disabled', false);
      });
  };

  $scope.deletePolls = function () {
    $http.get('http://' + window.location.hostname + '/ppapi/polls/delete/all').success(function (data, status, headers, config) {
    });
  };*/

  //async?
  $scope.fetch10Best();



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
