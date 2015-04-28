(function(){

var cont = angular.module('poll-princeton.controllers');

cont.controller('pollController', function ($scope, $filter, $http, $location) {

  $('body').css('padding-top', '50px');

  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  $scope.fetchedPoll = false;
  $scope.showPlots = false;

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
    do {
      var user = localStorage.getItem('netid');
      var ticket = localStorage.getItem('ticket');
    } while (user == null || ticket == null);
    $http.get('http://' + window.location.hostname + '/ppapi/polls/get/' + pid + '/' + user + '/' + ticket).success(function (data, status, headers, config) {
      $scope.poll = data;
      var thisPoll = $scope.poll;
      var date = new Date(thisPoll.time);
      thisPoll.humanTime = months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
      thisPoll.numResponses = thisPoll.responses.reduce(function(a, b) {
        return a + b;
      });
      console.log($scope.poll.responses);
      $scope.fetchedPoll = true;
      redrawBars();
      document.title = $scope.poll.question + ' | PollPrinceton';
    });
  }

  
  function redrawBars() {
    var maxResp = Math.max.apply(Math, $scope.poll.responses);
    $scope.barWidths = [];
    var data = [];
    var increment = 0.9 / $scope.poll.responses.length;
    var sliceOpacity = 0.95;
    for(var i in $scope.poll.responses) {
      var frac = $scope.poll.responses[i] / maxResp;
      var newWidth = (frac * 100 * .8) + '%';
      $scope.barWidths.push(newWidth);
      var element = {label: $scope.poll.choices[i], data: $scope.poll.responses[i], color: 'rgba(255, 136, 120,' + sliceOpacity + ')'};
      sliceOpacity -= increment;
      data.push(element);
    }
    $.plot('#placeholder', data, {
        series: {
            pie: {
                show: true,
                radius: 1,
                label: {
                    show: true,
                    radius: 1/2,
                    background: {
                        opacity: 0.5
                    }
                }
            }
        },
        legend: {
            show: false
        }
    });
    $('.pieLabel div').css('color', 'white');
    $('.pieLabelBackground').css('background', 'none');
  };

  $scope.upVote = function (pid) {
    var pkg = {};
    do {
      var user = localStorage.getItem('netid');
      var ticket = localStorage.getItem('ticket');
    } while (user == null || ticket == null);
    pkg.upOrDown = true;
    pkg.pollID = pid;
    pkg.netid = user;
    pkg.ticket = ticket;
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
    do {
      var user = localStorage.getItem('netid');
      var ticket = localStorage.getItem('ticket');
    } while (user == null || ticket == null);
    pkg.upOrDown = false;
    pkg.pollID = pid;
    pkg.netid = user;
    pkg.ticket = ticket;
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
    do {
      var user = localStorage.getItem('netid');
      var ticket = localStorage.getItem('ticket');
    } while (user == null || ticket == null);
    pkg.netid = user;
    pkg.ticket = ticket;
    pkg.pid = $scope.poll.pid;
    $http.post('/ppapi/polls/respond', pkg)
      .success(function (data, status, headers, config) {
        if (data.err !== true) {
          $scope.poll.responses = data.responses;
          $scope.poll.userResponse = data.userResponse;
          console.log($scope.poll.responses);
          redrawBars();
          $scope.poll.numResponses = $scope.poll.responses.reduce(function(a, b) {
            return a + b;
          });
        }
      })
      .error(function (data, status, headers, config) {
        alert('Something went wrong. Please try to submit again in a few moments.');
      });
  };

  $scope.deletePoll = function () {
    var answer = confirm('This poll and its results will be permanently deleted. Are you sure you want to continue?');
    if (!answer) return;
    do {
      var user = localStorage.getItem('netid');
      var ticket = localStorage.getItem('ticket');
    } while (user == null || ticket == null);
    $http.delete('/ppapi/polls/delete/' + $scope.poll.pid + '/' + user + '/' + ticket, {})
      .success(function (data, status, headers, config) {
        if (data.err) {
          alert('Something went wrong. Error message: ' + data.msg);
        }
        else {
          alert('The poll was permanently deleted.');
          window.location = 'http://' + window.location.hostname + window.location.pathname;
        }
      });
  };

  $scope.showLowerPlots = function() {
    $('.lower-plots').css('visibility','visible');
    redrawBars();
  };

  var GET = getUrlVars();
  var pid = GET['p'];

  fetchPoll(pid);
  $scope.netid = localStorage.getItem('netid');

});

})();
