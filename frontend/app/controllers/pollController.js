(function(){

var cont = angular.module('poll-princeton.controllers');

cont.controller('pollController', function ($scope, $filter, $http, $location) {

  /* Handle older browsers without good window.location support */
  if (window.location.hostname == null) {
    $scope.hostname = 'pollprinceton.com';
    $scope.rootUrl = 'http://pollprinceton.com/'
  }
  else {
    $scope.hostname = window.location.hostname;
    $scope.rootUrl = 'http://' + window.location.hostname + window.location.pathname;
  }

  var colors = ['rgb(255,155,127)',
                'rgb(74, 120, 156)',
                'rgb(187, 115, 101)',
                'rgb(127, 202, 159)',
                'rgb(235, 119, 166)',
                'rgb(138,28,1)',
                'rgb(133, 193, 245)',
                'rgb(238,59,18)',
                'rgb(244, 186, 112)',
                'rgb(152, 129, 245)'];
  $scope.demoCategory = 'major';
  $scope.manualShowDemographics = false;
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
    $http.get('http://' + $scope.hostname + '/ppapi/polls/get/' + pid + '/' + user + '/' + ticket).success(function (data, status, headers, config) {
      $scope.poll = data;
      var thisPoll = $scope.poll;
      var date = new Date(thisPoll.time);
      thisPoll.humanTime = formatAMPM(date) + ' on ' + months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
      thisPoll.numResponses = thisPoll.responses.reduce(function(a, b) {
        return a + b;
      });
      $scope.fetchedPoll = true;
      redrawBars();
      if (($scope.manualShowDemographics || data.userResponse != -1) && $scope.poll.numResponses >= 5) {
        $scope.showDemographics('major');
        $('#not-enough-responses').fadeOut();
      }
      else if ($scope.manualShowDemographics || data.userResponse != -1) {
        $('#not-enough-responses').fadeIn();
        $scope.hideDemographics();
      }
      else {
        $scope.hideDemographics();
      }
      document.title = $scope.poll.question + ' | PollPrinceton';
    });
  }

  $scope.showDemographics = function (category) {
    if ($scope.poll.numResponses >= 5) {
      if (category != null) {
        $('.lower-plots').css('visibility', 'visible');
        $scope.switchDemoCategory(category);
      }
      else {
        $('.lower-plots').css('visibility', 'visible');
        $scope.switchDemoCategory($scope.demoCategory);
      }
    }
    else {
      $('#not-enough-responses').fadeIn();
    }
  };

  $scope.hideDemographics = function () {
    $('.lower-plots').css('visibility', 'hidden');
    $('.plot-tab').css('visibility', 'hidden');
  };

  function redrawBars() {
    var maxResp = Math.max.apply(Math, $scope.poll.responses);
    $scope.barWidths = [];
    for(var i in $scope.poll.responses) {
      var frac = $scope.poll.responses[i] / maxResp;
      var newWidth = (frac * 100 * .8) + '%';
      $scope.barWidths.push(newWidth);
    }

    if ($scope.poll.numResponses >= 5) {
      /* Check for groups with no responders. */
      $scope.demoTallies = {};
      $scope.demoTallies.ab = $scope.poll.demographics.ab.reduce(function(a, b) {return a + b;});
      $scope.demoTallies.bse = $scope.poll.demographics.bse.reduce(function(a, b) {return a + b;});
      $scope.demoTallies.class2015 = $scope.poll.demographics.class2015.reduce(function(a, b) {return a + b;});
      $scope.demoTallies.class2016 = $scope.poll.demographics.class2016.reduce(function(a, b) {return a + b;});
      $scope.demoTallies.class2017 = $scope.poll.demographics.class2017.reduce(function(a, b) {return a + b;});
      $scope.demoTallies.class2018 = $scope.poll.demographics.class2018.reduce(function(a, b) {return a + b;});
      $scope.demoTallies.class2019 = $scope.poll.demographics.class2019.reduce(function(a, b) {return a + b;});
      $scope.demoTallies.butler = $scope.poll.demographics.butler.reduce(function(a, b) {return a + b;});
      $scope.demoTallies.forbes = $scope.poll.demographics.forbes.reduce(function(a, b) {return a + b;});
      $scope.demoTallies.wilson = $scope.poll.demographics.wilson.reduce(function(a, b) {return a + b;});
      $scope.demoTallies.whitman = $scope.poll.demographics.whitman.reduce(function(a, b) {return a + b;});
      $scope.demoTallies.mathey = $scope.poll.demographics.mathey.reduce(function(a, b) {return a + b;});
      $scope.demoTallies.rocky = $scope.poll.demographics.rocky.reduce(function(a, b) {return a + b;});


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
          },
          legend: {
              backgroundColor: 'none',
              labelBoxBorderColor: 'none'
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
          },
          legend: {
              backgroundColor: 'none',
              labelBoxBorderColor: 'none'
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
          },
          legend: {
              backgroundColor: 'none',
              labelBoxBorderColor: 'none'
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
          },
          legend: {
              backgroundColor: 'none',
              labelBoxBorderColor: 'none'
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
          },
          legend: {
              backgroundColor: 'none',
              labelBoxBorderColor: 'none'
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
          },
          legend: {
              backgroundColor: 'none',
              labelBoxBorderColor: 'none'
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
          },
          legend: {
              backgroundColor: 'none',
              labelBoxBorderColor: 'none'
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
          },
          legend: {
              backgroundColor: 'none',
              labelBoxBorderColor: 'none'
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
          },
          legend: {
              backgroundColor: 'none',
              labelBoxBorderColor: 'none'
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
          },
          legend: {
              backgroundColor: 'none',
              labelBoxBorderColor: 'none'
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
          },
          legend: {
              backgroundColor: 'none',
              labelBoxBorderColor: 'none'
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
          },
          legend: {
              backgroundColor: 'none',
              labelBoxBorderColor: 'none'
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
          },
          legend: {
              backgroundColor: 'none',
              labelBoxBorderColor: 'none'
          }
      });
    }

    // Styling
    $('.piechart .legend div').css('background-color','none');
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
        $('.user-karma').text(data.userKarma);
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
        $('.user-karma').text(data.userKarma);
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
          $scope.poll.numResponses = $scope.poll.responses.reduce(function(a, b) {
            return a + b;
          });
          if (($scope.manualShowDemographics || data.userResponse != -1) && $scope.poll.numResponses >= 5) {
            $scope.showDemographics();
            $('#not-enough-responses').fadeOut();
          }
          else if (($scope.manualShowDemographics || data.userResponse != -1) || ($scope.manualShowDemographics && data.userResponse == -1)) {
            $scope.hideDemographics();
            $('#not-enough-responses').fadeIn();
          }
          else {
            $scope.hideDemographics();
            $('#not-enough-responses').fadeOut();
          }
          redrawBars();
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
          window.location = $scope.rootUrl;
        }
      });
  };

  $scope.reportPoll = function () {
    var answer = confirm('Are you sure you want to report this poll? Polls should only be reported if they are offensive, personal attacks or spam.');
    if (!answer) return;
    var reportTicket = {};
    do {
      var user = localStorage.getItem('netid');
      var ticket = localStorage.getItem('ticket');
    } while (user == null || ticket == null);
    reportTicket.author = user;
    reportTicket.ticket = ticket;
    reportTicket.pollID = $scope.poll.pid;
    $http.post('/ppapi/polls/report', reportTicket)
      .success(function (data, status, headers, config) {
        // send them to the url for that poll
        if (data.success)
          alert('This poll has been reported.');
        else
          alert('You have already reported this poll');
      })
      .error(function (data, status, headers, config) {
        alert('Something went wrong. Please try to report again in a few moments.')
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

  $scope.manuallyShowDemographics = function () {
    $scope.manualShowDemographics = true;
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

  fetchPoll(pid);
  $scope.netid = localStorage.getItem('netid');
  window.scrollTo(0,0);

});

})();
