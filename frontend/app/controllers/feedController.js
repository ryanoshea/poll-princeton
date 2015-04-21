(function(){

var cont = angular.module('poll-princeton.controllers');

cont.controller('feedController', function ($scope, $filter, $http, $location) {

  document.title = 'Feed | PollPrinceton'

  $('body').css('padding-top', '50px');

  $scope.fetchedDevs = false;
  $scope.fetchedPolls = false;
  $scope.polls = [];
  $scope.currentPolls = 0;
  $scope.sort = "popular";

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

  //Get call returns an array of objects containing three things: pollData (a complete poll with all data),
  //userVote (true for up, false for down) and userResponse (however Ryan implemented it. -1 for no response I think)
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

  $scope.sortPopular = function () {
    if ($scope.sort !== 'popular') {
      $('.polls').fadeOut(function () {
        $scope.sort = 'popular';
        $scope.polls = [];
        $scope.currentPolls = 0;
        $scope.fetch10Best();
        $('.polls').fadeIn();
      });
    }
  };

  $scope.sortNewest = function () {
    if ($scope.sort !== 'newest') {
      $('.polls').fadeOut(function () {
        $scope.sort = 'newest';
        $scope.polls = [];
        $scope.currentPolls = 0;
        $scope.fetch10New();
        $('.polls').fadeIn();
      });
    }
  };

  $scope.fetch10Best();
});

})();
