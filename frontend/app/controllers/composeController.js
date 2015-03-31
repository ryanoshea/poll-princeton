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
      choices: ["", ""]
    };
  };

  $scope.pollEmpty = function () {
    var emptyChoices = true;

    for (var i in $scope.newPoll.choices) {
      if ($scope.newPoll.choices[i] != "") emptyChoices = false;
    }

    return ($scope.newPoll.question == "" && emptyChoices);
  };

  $scope.addChoice = function () {
    $scope.newPoll.choices.push("");
  };

  $scope.deleteChoice = function (index) {
    if ($scope.newPoll.choices.length > 2) {
      $scope.newPoll.choices.splice(index, 1);
    }
    else {
      alert('You can\'t delete this choice. Polls need at least 2 choices.')
    }
  };

  $scope.pollValid = function () {
    return !$scope.pollEmpty();
  };

  $scope.submitPoll = function () {
    if (!$scope.pollValid()) return;
    $('.poll-submit').attr('disabled', true);
    var poll = {};
    poll.question = $scope.newPoll.question;
    poll.choices = $scope.newPoll.choices;
    poll.author = 'pp-test'; // Change this when accounts work
    poll.time = new Date();

    $http.post('/ppapi/polls/submit', poll)
      .success(function (data, status, headers, config) {
        $scope.clearPoll();
        $scope.hideComposeFlyout();
        // send them to the url for that poll
      })
      .error(function (data, status, headers, config) {
        alert('Something went wrong. Please try to submit again in a few moments.')
        $('.poll-submit').attr('disabled', false);
      });
  };

  $scope.printPoll = function () {
    /*console.log($scope.newPoll);*/
  }

  $scope.clearPoll();

});

})();
