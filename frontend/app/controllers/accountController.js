(function(){

var cont = angular.module('poll-princeton.controllers');

cont.controller('accountController', function ($scope, $filter, $http, $location) {

  document.title = 'My Account | PollPrinceton'

  $('body').css('padding-top', '50px');

  $scope.fetchedDevs = false;
  $scope.fetchedPolls = false;
  $scope.fetching = true;
  $scope.noMorePolls = false;
  $scope.polls = [];
  $scope.currentPolls = 0;
  $scope.sort = "popular";


  var onlyUser = '/true';
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }

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
        thisPoll.humanTime = formatAMPM(date) + ' on ' + months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
      }
      $scope.fetchedPolls = true;
    });
  };

  //Get call returns an array of objects containing three things: pollData (a complete poll with all data),
  //userVote (true for up, false for down) and userResponse (however Ryan implemented it. -1 for no response I think)
  $scope.fetch10Best = function () {
    do {
      var user = localStorage.getItem('netid');
      var ticket = localStorage.getItem('ticket');
    } while (user == null || ticket == null);
    $http.get('http://' + window.location.hostname + '/ppapi/polls/get/popular/'
        + user + '/' + ticket + '/' + $scope.currentPolls + onlyUser).success(function (data, status, headers, config) {
      $scope.fetching = false;
      if (data.err) {
        $scope.noMorePolls = true;
        return;
      }
      $scope.polls = data;
      $scope.currentPolls = 10;
      for (var i in $scope.polls) {
        var thisPoll = $scope.polls[i].pollData;
        var date = new Date(thisPoll.time);
        thisPoll.humanTime = formatAMPM(date) + ' on ' + months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
        thisPoll.numResponses = thisPoll.responses.reduce(function(a, b) {
          return a + b;
        });
      }
      $scope.fetchedPolls = true;
    });
  };

  $scope.fetchNext10Best = function () {
    if ($scope.noMorePolls) return;
    do {
      var user = localStorage.getItem('netid');
      var ticket = localStorage.getItem('ticket');
    } while (user == null || ticket == null);
    $http.get('http://' + window.location.hostname + '/ppapi/polls/get/popular/'
        + user + '/' + ticket + '/' + $scope.currentPolls + onlyUser)
      .success(function (data, status, headers, config) {
        $scope.fetching = false;
        if (data.err) {
          $scope.noMorePolls = true;
          return;
        }
        var polls = data;
        $scope.currentPolls += 10;
        for (var i in polls) {
          var thisPoll = polls[i].pollData;
          var date = new Date(thisPoll.time);
          thisPoll.humanTime = formatAMPM(date) + ' on ' + months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
          thisPoll.numResponses = thisPoll.responses.reduce(function(a, b) {
            return a + b;
          });
          $scope.polls.push(polls[i]);
        }
      });
  };

  $scope.fetch10New = function () {
    do {
      var user = localStorage.getItem('netid');
      var ticket = localStorage.getItem('ticket');
    } while (user == null || ticket == null);
    $http.get('http://' + window.location.hostname + '/ppapi/polls/get/newest/'
        + user + '/' + ticket + '/' + $scope.currentPolls + onlyUser).success(function (data, status, headers, config) {
      $scope.fetching = false;
      if (data.err) {
        $scope.noMorePolls = true;
        return;
      }
      $scope.polls = data;
      $scope.currentPolls = 10;
      for (var i in $scope.polls) {
        var thisPoll = $scope.polls[i].pollData;
        var date = new Date(thisPoll.time);
        thisPoll.humanTime = formatAMPM(date) + ' on ' + months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
        thisPoll.numResponses = thisPoll.responses.reduce(function(a, b) {
          return a + b;
        });
      }
      $scope.fetchedPolls = true;
    });
  };

  $scope.fetchNext10New = function () {
    if ($scope.noMorePolls) return;
    do {
      var user = localStorage.getItem('netid');
      var ticket = localStorage.getItem('ticket');
    } while (user == null || ticket == null);
    var user = localStorage.getItem('netid');
    $http.get('http://' + window.location.hostname + '/ppapi/polls/get/newest/'
        + user + '/' + ticket + '/' + $scope.currentPolls + onlyUser)
      .success(function (data, status, headers, config) {
        $scope.fetching = false;
        if (data.err) {
          $scope.noMorePolls = true;
          return;
        }
        var polls = data;
        $scope.currentPolls += 10;
        for (var i in polls) {
          var thisPoll = polls[i].pollData;
          var date = new Date(thisPoll.time);
          thisPoll.humanTime = formatAMPM(date) + ' on ' + months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
          thisPoll.numResponses = thisPoll.responses.reduce(function(a, b) {
            return a + b;
          });
          $scope.polls.push(polls[i]);
        }
      });
  };

  $scope.fetchMore = function () {
    if ($scope.sort === 'popular') $scope.fetchNext10Best();
    else $scope.fetchNext10New();
  };

  $scope.upVote = function (pid, idx) {
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
        $scope.polls[idx].pollData.score = data.score;
        $scope.polls[idx].userVote = data.userVote;
      })
      .error(function (data, status, headers, config) {
        alert('Something went wrong. Please try to submit again in a few moments.')
        $('.vote-submit').attr('disabled', false);
      });
  };

  $scope.downVote = function (pid, idx) {
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
        $scope.polls[idx].pollData.score = data.score;
        $scope.polls[idx].userVote = data.userVote;
      })
      .error(function (data, status, headers, config) {
        alert('Something went wrong. Please try to submit again in a few moments.')
        $('.vote-submit').attr('disabled', false);
      });
  };

  $scope.deletePolls = function () {
    $http.get('http://' + window.location.hostname + '/ppapi/polls/delete/all').success(function (data, status, headers, config) {
    });
  };

  $scope.sortPopular = function () {
    if ($scope.sort !== 'popular') {
      $('.polls').fadeOut(function () {
        $scope.noMorePolls = false;
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
        $scope.noMorePolls = false;
        $scope.sort = 'newest';
        $scope.polls = [];
        $scope.currentPolls = 0;
        $scope.fetch10New();
        $('.polls').fadeIn();
      });
    }
  };

  $scope.goToPoll = function (pid) {
    window.location = 'http://' + window.location.hostname + window.location.pathname + '#/poll?p=' + pid;
  };

  $scope.refresh = function () {
    location.reload();
  };

  $scope.fetch10Best();

  $(window).scroll(function () {
    if ($scope.fetchedPolls && $(window).height() + $(window).scrollTop() == $(document).height()) {
      $scope.fetching = true;
      $scope.fetchMore();
    }
  });
});

})();
