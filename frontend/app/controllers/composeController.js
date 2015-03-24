(function(){

var cont = angular.module('poll-princeton.controllers');

cont.controller('composeController', function ($scope, $filter, $http, $location) {
   $scope.showComposeFlyout = function () {
    $('html').css('overflow', 'hidden');
    $('.flyout-compose').fadeIn('medium');
    $('.flyout-compose-contents').show('medium');
  };
  $scope.hideComposeFlyout = function () {
    if (!$scope.pollEmpty()) {
      var answer = confirm('You have unsaved changes. Click OK to exit and delete your work, or Cancel to keep writing.');
      if (!answer) {
        return
      }
    }
    $('.flyout-compose').fadeOut('medium');
    $('.flyout-compose-contents').hide('medium');
    $('html').css('overflow', 'auto');
    $scope.clearPoll();
  };

  $scope.clearPoll = function () {
    $scope.newPoll = {
      question: "",
      options: ["", ""]
    };
  };

  $scope.pollEmpty = function () {
    var emptyOptions = true;

    for (var i in $scope.newPoll.options) {
      if ($scope.newPoll.options[i] != "") emptyOptions = false;
    }

    return ($scope.newPoll.question == "" && emptyOptions);
  };

  $scope.addOption = function () {
    $scope.newPoll.options.push("");
  };

  $scope.deleteOption = function (index) {
    if ($scope.newPoll.options.length > 2) {
      $scope.newPoll.options.splice(index, 1);
    }
    else {
      alert('You can\'t delete this option. Polls need at least 2 choices.')
    }
  };

  $scope.printPoll = function () {
    /*console.log($scope.newPoll);*/
  }

  $scope.clearPoll();

});

})();
