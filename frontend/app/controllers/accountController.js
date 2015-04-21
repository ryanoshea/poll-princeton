(function(){

var cont = angular.module('poll-princeton.controllers');

cont.controller('accountController', function ($scope, $filter, $http, $location) {

  document.title = 'My Account | PollPrinceton'

  $('body').css('padding-top', '50px');

  $scope.fetchedPolls = false;
  $scope.polls = [];
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];


  $scope.fetchMyPolls = function () {
    var user = localStorage.getItem('netid');
    $http.get('http://' + window.location.hostname + '/ppapi/polls/get/newest/' 
        + user + '/' + $scope.currentPolls + '/true').success(function (data, status, headers, config) {
      $scope.polls = data;
      for (var i in $scope.poll) {
        var thisPoll = $scope.polls[i].pollData;
        var date = new Date(thisPoll.time);
        thisPoll.humanTime = months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
      }
      $scope.fetchedPolls = true;
    });
  };

  $scope.fetchMyPolls();

});

})();