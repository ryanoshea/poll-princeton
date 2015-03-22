(function(){

var cont = angular.module('poll-princeton.controllers');

cont.controller('composeController', function ($scope, $filter, $http, $location) {
   $scope.showComposeFlyout = function () {
    $('html').css('overflow', 'hidden');
    $('.flyout-compose').fadeIn('fast');
    $('.flyout-compose-contents').show('fast');
  };
  $scope.hideComposeFlyout = function () {
    $('.flyout-compose').fadeOut('fast');
    $('.flyout-compose-contents').hide('fast');
    $('html').css('overflow', 'auto');
  };

  $scope.newPoll = {
    question: "",
    options: ["", ""]
  };

  $scope.addOption = function () {
    $scope.newPoll.options.push("");
  };

  $scope.printPoll = function () {
    console.log($scope.newPoll);
  }

});

})();
