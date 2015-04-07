(function(){

var cont = angular.module('poll-princeton.controllers');

cont.controller('pollController', function ($scope, $filter, $http, $location) {

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
    $http.get('http://' + window.location.hostname + '/ppapi/polls/get/' + pid).success(function (data, status, headers, config) {
      $scope.poll = data;
      var thisPoll = $scope.poll;
      var date = new Date(thisPoll.time);
      thisPoll.humanTime = months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
      $scope.fetchedPoll = true;
    });
  }

  var GET = getUrlVars();
  var pid = GET['p'];

  fetchPoll(pid);

  console.log(pid);

});

})();
