(function(){

var cont = angular.module('poll-princeton.controllers');

cont.controller('pollController', function ($scope, $filter, $http, $location) {

  var colors = ['rgb(255,155,127)',
                'rgb(74, 120, 156)',
                'rgb(187, 115, 101)',
                'rgb(127, 202, 159)',
                'rgb(239,184,142)',
                'rgb(138,28,1)',
                'rgb(133, 193, 245)',
                'rgb(238,59,18)',
                'rgb(244, 186, 112)',
                'rgb(152, 129, 245)'];
  $scope.demoCategory = '';
  $('body').css('padding-top', '50px');

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
      thisPoll.humanTime = formatAMPM(date) + ' on ' + months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
      thisPoll.numResponses = thisPoll.responses.reduce(function(a, b) {
        return a + b;
      });
      console.log($scope.poll.responses);
      $scope.fetchedPoll = true;
      redrawBars();
      if ($scope.poll.userResponse == -1) {
        $('.lower-plots').css('visibility', 'hidden');
      }
      else {
        $('.lower-plots').css('visibility', 'visible');
      }
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


    var data = [];
    for(var i in $scope.poll.responses) {
      var trimmedChoice = '';
      if ($scope.poll.choices[i].length > 15) {
        trimmedChoice = $scope.poll.choices[i].substring(0,15) + '…';
      }
      else {
        trimmedChoice = $scope.poll.choices[i];
      }
      var element = {label: trimmedChoice, data: $scope.poll.demographics.ab[i], color: colors[i]};
      data.push(element);
    }
    $.plot('#plot-ab', data, {
        series: {
            pie: {
                show: true
            }
        }
    });

    var data = [];
    for(var i in $scope.poll.responses) {
      var trimmedChoice = '';
      if ($scope.poll.choices[i].length > 15) {
        trimmedChoice = $scope.poll.choices[i].substring(0,15) + '…';
      }
      else {
        trimmedChoice = $scope.poll.choices[i];
      }
      var element = {label: trimmedChoice, data: $scope.poll.demographics.bse[i], color: colors[i]};
      data.push(element);
    }
    $.plot('#plot-bse', data, {
        series: {
            pie: {
                show: true
            }
        }
    });

    var data = [];
    for(var i in $scope.poll.responses) {
      var trimmedChoice = '';
      if ($scope.poll.choices[i].length > 15) {
        trimmedChoice = $scope.poll.choices[i].substring(0,15) + '…';
      }
      else {
        trimmedChoice = $scope.poll.choices[i];
      }
      var element = {label: trimmedChoice, data: $scope.poll.demographics.class2015[i], color: colors[i]};
      data.push(element);
    }
    $.plot('#plot-2015', data, {
        series: {
            pie: {
                show: true
            }
        }
    });

    var data = [];
    for(var i in $scope.poll.responses) {
      var trimmedChoice = '';
      if ($scope.poll.choices[i].length > 15) {
        trimmedChoice = $scope.poll.choices[i].substring(0,15) + '…';
      }
      else {
        trimmedChoice = $scope.poll.choices[i];
      }
      var element = {label: trimmedChoice, data: $scope.poll.demographics.class2016[i], color: colors[i]};
      data.push(element);
    }
    $.plot('#plot-2016', data, {
        series: {
            pie: {
                show: true
            }
        }
    });

    var data = [];
    for(var i in $scope.poll.responses) {
      var trimmedChoice = '';
      if ($scope.poll.choices[i].length > 15) {
        trimmedChoice = $scope.poll.choices[i].substring(0,15) + '…';
      }
      else {
        trimmedChoice = $scope.poll.choices[i];
      }
      var element = {label: trimmedChoice, data: $scope.poll.demographics.class2017[i], color: colors[i]};
      data.push(element);
    }
    $.plot('#plot-2017', data, {
        series: {
            pie: {
                show: true
            }
        }
    });

    var data = [];
    for(var i in $scope.poll.responses) {
      var trimmedChoice = '';
      if ($scope.poll.choices[i].length > 15) {
        trimmedChoice = $scope.poll.choices[i].substring(0,15) + '…';
      }
      else {
        trimmedChoice = $scope.poll.choices[i];
      }
      var element = {label: trimmedChoice, data: $scope.poll.demographics.class2018[i], color: colors[i]};
      data.push(element);
    }
    $.plot('#plot-2018', data, {
        series: {
            pie: {
                show: true
            }
        }
    });

    var data = [];
    for(var i in $scope.poll.responses) {
      var trimmedChoice = '';
      if ($scope.poll.choices[i].length > 15) {
        trimmedChoice = $scope.poll.choices[i].substring(0,15) + '…';
      }
      else {
        trimmedChoice = $scope.poll.choices[i];
      }
      var element = {label: trimmedChoice, data: $scope.poll.demographics.class2019[i], color: colors[i]};
      data.push(element);
    }
    $.plot('#plot-2019', data, {
        series: {
            pie: {
                show: true
            }
        }
    });

    var data = [];
    for(var i in $scope.poll.responses) {
      var trimmedChoice = '';
      if ($scope.poll.choices[i].length > 15) {
        trimmedChoice = $scope.poll.choices[i].substring(0,15) + '…';
      }
      else {
        trimmedChoice = $scope.poll.choices[i];
      }
      var element = {label: trimmedChoice, data: $scope.poll.demographics.butler[i], color: colors[i]};
      data.push(element);
    }
    $.plot('#plot-butler', data, {
        series: {
            pie: {
                show: true
            }
        }
    });

    var data = [];
    for(var i in $scope.poll.responses) {
      var trimmedChoice = '';
      if ($scope.poll.choices[i].length > 15) {
        trimmedChoice = $scope.poll.choices[i].substring(0,15) + '…';
      }
      else {
        trimmedChoice = $scope.poll.choices[i];
      }
      var element = {label: trimmedChoice, data: $scope.poll.demographics.forbes[i], color: colors[i]};
      data.push(element);
    }
    $.plot('#plot-forbes', data, {
        series: {
            pie: {
                show: true
            }
        }
    });

    var data = [];
    for(var i in $scope.poll.responses) {
      var trimmedChoice = '';
      if ($scope.poll.choices[i].length > 15) {
        trimmedChoice = $scope.poll.choices[i].substring(0,15) + '…';
      }
      else {
        trimmedChoice = $scope.poll.choices[i];
      }
      var element = {label: trimmedChoice, data: $scope.poll.demographics.mathey[i], color: colors[i]};
      data.push(element);
    }
    $.plot('#plot-mathey', data, {
        series: {
            pie: {
                show: true
            }
        }
    });

    var data = [];
    for(var i in $scope.poll.responses) {
      var trimmedChoice = '';
      if ($scope.poll.choices[i].length > 15) {
        trimmedChoice = $scope.poll.choices[i].substring(0,15) + '…';
      }
      else {
        trimmedChoice = $scope.poll.choices[i];
      }
      var element = {label: trimmedChoice, data: $scope.poll.demographics.rocky[i], color: colors[i]};
      data.push(element);
    }
    $.plot('#plot-rocky', data, {
        series: {
            pie: {
                show: true
            }
        }
    });

    var data = [];
    for(var i in $scope.poll.responses) {
      var trimmedChoice = '';
      if ($scope.poll.choices[i].length > 15) {
        trimmedChoice = $scope.poll.choices[i].substring(0,15) + '…';
      }
      else {
        trimmedChoice = $scope.poll.choices[i];
      }
      var element = {label: trimmedChoice, data: $scope.poll.demographics.whitman[i], color: colors[i]};
      data.push(element);
    }
    $.plot('#plot-whitman', data, {
        series: {
            pie: {
                show: true
            }
        }
    });

    var data = [];
    for(var i in $scope.poll.responses) {
      var trimmedChoice = '';
      if ($scope.poll.choices[i].length > 15) {
        trimmedChoice = $scope.poll.choices[i].substring(0,15) + '…';
      }
      else {
        trimmedChoice = $scope.poll.choices[i];
      }
      var element = {label: trimmedChoice, data: $scope.poll.demographics.wilson[i], color: colors[i]};
      data.push(element);
    }
    $.plot('#plot-wilson', data, {
        series: {
            pie: {
                show: true
            }
        }
    });
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
          $scope.poll.demographics = data.demographics;
          console.log($scope.poll.responses);
          redrawBars();
          if (data.userResponse == -1) {
            $('.lower-plots').css('visibility', 'hidden');
          }
          else {
            $('.lower-plots').css('visibility', 'visible');
          }
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

  // Changes which plots are displayed based on which demographic category the user selects
  $scope.switchDemoCategory = function (newCategory) {
    $scope.demoCategory = newCategory;
    $('.plot-tab').css('visibility', 'hidden');
    switch (newCategory) {
      case 'major':
        $('#plot-major').css('visibility','visible');
        break;
      case 'class':
        $('#plot-class').css('visibility','visible');
        break;
      case 'college':
        $('#plot-college').css('visibility','visible');
        break;
    }
  };

  var GET = getUrlVars();
  var pid = GET['p'];

  $scope.seniorYear = true;
  var date = new Date();
  if (date.getFullYear() != 2015 || (date.getFullYear() == 2015 && date.getMonth() > 6)) {
    $scope.seniorYear = true;
  }
  else {
    $scope.seniorYear = false;
  }

  $scope.switchDemoCategory('major');
  fetchPoll(pid);
  $scope.netid = localStorage.getItem('netid');

});

})();
