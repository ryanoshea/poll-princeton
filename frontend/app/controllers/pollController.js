(function(){

var cont = angular.module('poll-princeton.controllers');

cont.controller('pollController', function ($scope, $filter, $http, $location) {

  $('body').css('padding-top', '50px');

  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  $scope.fetchedPoll = false;

  function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
      hash = hashes[i].split('=');
      vars.push(hash[0]);
      vars[hash[0]] = hash[1];
    }
    return vars;
  }

  function fetchPoll(pid) {
    $http.get('http://' + window.location.hostname + '/ppapi/polls/get/' + pid + '/' + localStorage.getItem('netid')).success(function (data, status, headers, config) {
      $scope.poll = data;
      var thisPoll = $scope.poll;
      var date = new Date(thisPoll.time);
      thisPoll.humanTime = months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
      $scope.fetchedPoll = true;
      redrawBars();
      document.title = $scope.poll.question + ' | PollPrinceton';
    });
  }

  function redrawBars() {
    var maxResp = Math.max.apply(Math, $scope.poll.responses);
    $scope.barWidths = [];
    for(var i in $scope.poll.responses) {
      var frac = $scope.poll.responses[i] / maxResp;
      var newWidth = (frac * 100 * .8) + '%';
      $scope.barWidths.push(newWidth);
    }
  };

  $scope.upVote = function (pid) {
    var pkg = {};
    var user = localStorage.getItem('netid');
    pkg.upOrDown = true;
    pkg.pollID = pid;
    pkg.netid = user;
    $http.post('/ppapi/polls/vote', pkg)
      .success(function (data, status, headers, config) {
        //Update the number displayed for the poll. Color the arrow.
        $scope.poll.score = data.score;
        $scope.poll.userVote = data.userVote;
      })
      .error(function (data, status, headers, config) {
        alert('Something went wrong. Please try to submit again in a few moments.');
        $('.vote-submit').attr('disabled', false);
      });
  };

  $scope.downVote = function (pid) {
    var pkg = {};
    var user = localStorage.getItem('netid');
    pkg.upOrDown = false;
    pkg.pollID = pid;
    pkg.netid = user;
    $http.post('/ppapi/polls/vote', pkg)
      .success(function (data, status, headers, config) {
        //Update the number displayed for the poll. Color the arrow.
        $scope.poll.score = data.score;
        $scope.poll.userVote = data.userVote;
      })
      .error(function (data, status, headers, config) {
        alert('Something went wrong. Please try to submit again in a few moments.');
        $('.vote-submit').attr('disabled', false);
      });
  };

  $scope.respond = function (idx) {
    var pkg = {};
    pkg.idx = idx;
    pkg.netid = localStorage.getItem('netid');
    pkg.pid = $scope.poll.pid;
    $http.post('/ppapi/polls/respond', pkg)
      .success(function (data, status, headers, config) {
        if (data.err !== true) {
          $scope.poll.responses = data.responses;
          $scope.poll.userResponse = data.userResponse;
          redrawBars();
        }
      })
      .error(function (data, status, headers, config) {
        alert('Something went wrong. Please try to submit again in a few moments.');
      });
  };

  var GET = getUrlVars();
  var pid = GET['p'];

  fetchPoll(pid);

});

})();
