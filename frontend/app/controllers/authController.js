(function(){

var cont = angular.module('poll-princeton.controllers');

cont.controller('authController', function ($scope, $filter, $http, $location) {

  $scope.username = "";
  $scope.fullname = "";

  // One way of parsing GET variables
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
  var GET = getUrlVars();

  // Check for credentials in this order: stored ticket in localStorage, then '?ticket=xxx' GET
  // variable.
  if (localStorage.getItem('ticket') !== null) {
    var ticket = localStorage.getItem('ticket');
    var netid = localStorage.getItem('netid');
  }
  else if (GET['ticket']) {
    if (GET['ticket'].indexOf('#') !== -1)
      var ticket = GET['ticket'].substring(0, GET['ticket'].indexOf('#'));
    else var ticket = GET['ticket'];
    var netid = "";
  }
  else {
    var ticket = "";
    var netid = "";
  }

  /* Handle URL problems on first log in from CAS. Also has the effect of removing ticket from URL
     during login */
  if ($('#page-feed').length > 0) {
    var url = window.location.href;
    if (url.indexOf('?ticket') !== -1 && url.indexOf('feed') > url.indexOf('?ticket')) {
      var ticketStr = url.substring(url.indexOf('?ticket='), url.indexOf('#'));
      var newUrl = url.substring(0, url.indexOf('?ticket=')) + '#/feed' + ticketStr;
      window.location = newUrl;
    }
  }
  var protectedPage = (($('#page-login').length == 0) && ($('#page-about').length == 0) && ($('#page-privacy').length == 0));
  /* Check with backend about user authentication status. Backend will verify that user is already
     logged in (ticket in localStorage) or the CAS login succeeded. */
  $http.post('/ppapi/auth/loggedin', {
    'ticket' : ticket,
    'netid' : netid,
    'returnUrl' : window.location.origin + window.location.pathname + '#/feed'})
    .success(function (data, status, headers, config) {
      if (!data.loggedin) {
        // User is not authenticated; wipe localStorage and send back to login page.
        localStorage.removeItem('ticket');
        localStorage.removeItem('netid');
        localStorage.removeItem('fullname');
        if (protectedPage)
          window.location = window.location.origin + window.location.pathname + '#/';
        else
          $('#content').css('visibility', 'visible');
      }
      else {
        // User is authenticated; store their ticket/netid in localStorage and send them to feed.
        localStorage.setItem('ticket', ticket);
        localStorage.setItem('netid', data.netid);
        localStorage.setItem('fullname', data.fullname);
        $scope.username = data.netid;
        $scope.fullname = data.fullname;
        if ($('#page-login').length > 0)
          window.location = window.location.origin + window.location.pathname + '#/feed';
        else
          $('#content').css('visibility', 'visible');
      }
    }).error(function (data, status, headers, config) {
      // Log them out, to be safe
      if (!data.loggedin) {
        localStorage.removeItem('ticket');
        localStorage.removeItem('netid');
        localStorage.removeItem('fullname');
        window.location = window.location.origin + window.location.pathname + '#/';
      }
    });

    $scope.logout = function () {
      var netid = localStorage.getItem('netid');
      localStorage.removeItem('ticket');
      localStorage.removeItem('netid');
      localStorage.removeItem('fullname');
      $http.get('/ppapi/auth/logout/' + netid)
      .success(function () {
        window.location = 'https://fed.princeton.edu/cas/logout';
      })
      .error(function() {
        window.location = 'https://fed.princeton.edu/cas/logout';
      });
    };

});

})();
