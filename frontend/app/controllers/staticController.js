(function(){

var cont = angular.module('poll-princeton.controllers');

cont.controller('staticController', function ($scope, $filter, $http, $location) {

  $('body').css('padding-top', '50px');
  window.scrollTo(0,0);

});

})();
