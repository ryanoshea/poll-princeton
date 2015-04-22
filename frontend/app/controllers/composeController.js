(function(){

var cont = angular.module('poll-princeton.controllers');

cont.controller('composeController', function ($scope, $filter, $http, $location) {

  $scope.showComposeFlyout = function () {
    $('html').css('overflow', 'hidden');
    $('.flyout-compose').fadeIn('medium');
    $('.flyout-compose-contents').show('medium');
    $('#poll-question').focus();
  };
  $scope.hideComposeFlyout = function () {
    if (!$scope.pollEmpty()) {
      var answer = confirm('You have unsaved changes. Click OK to exit and delete your work, or Cancel to keep writing.');
      if (!answer) {
        return;
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

  var bannedWords = ['ryan o\'shea', 'ryan oshea', 'tess marchant', 'henry lu','fuck', 'shit', 'cum', 'whore', 'slut', 'douche','cunt', 'nigger', 'fag'];
  $scope.pollValid = function () {
    var poll = $scope.newPoll;
    if ($scope.pollEmpty()) {
      $scope.invalidReason = 'Your poll is empty.';
      return false;
    }
    if (poll.question.length === 0) {
      $scope.invalidReason = 'Your poll needs to ask a question.';
      return false;
    }
    if (poll.question.length > 350) { // shouldn't happen, but just in case they get around limits with devtools
      $scope.invalidReason = 'Your question is too long.';
      return false;
    }
    for (var j in bannedWords) {
      if (poll.question.toLowerCase().indexOf(bannedWords[j].toLowerCase()) !== -1) {
        if (j < 4) {
          $scope.invalidReason = 'Your poll can\'t mention someone\'s name';
          return false;
        }
        else {
          $scope.invalidReason = 'Your poll can\'t contain profanity or hate speech.';
          return false;
        }
      }
    }
    for (var i in poll.choices) {
      if (poll.choices[i].length === 0) {
        $scope.invalidReason = 'Your poll can\'t have any blank choices.';
        return false;
      }
      if (poll.choices[i].length > 144) {
        $scope.invalidReason = 'One of your choices is too long.';
        return false;
      }
      for (var j in bannedWords) {
        if (poll.choices[i].toLowerCase().indexOf(bannedWords[j].toLowerCase()) !== -1) {
          if (j < 4) {
            $scope.invalidReason = 'Your poll can\'t mention someone\'s name';
            return false;
          }
          else {
            $scope.invalidReason = 'Your poll can\'t contain profanity or hate speech.';
            return false;
          }
        }
      }
    }
    var sortedChoices = poll.choices.slice(0).sort();
    for (var i = 0; i < sortedChoices.length - 1; i++) {
      if (sortedChoices[i] === sortedChoices[i + 1]) {
        $scope.invalidReason = 'Your poll can\'t have duplicate choices.';
        return false;
      }
    }
    $scope.invalidReason = 'Your poll is ready!';
    return true;
  };

  $scope.submitPoll = function () {
    if (!$scope.pollValid()) return;
    $('.poll-submit').attr('disabled', true);
    var poll = {};
    poll.question = $scope.newPoll.question;
    poll.choices = $scope.newPoll.choices;
    poll.author = localStorage.getItem('netid');  // Change this when accounts work

    $http.post('/ppapi/polls/submit', poll)
      .success(function (data, status, headers, config) {
        $scope.clearPoll();
        $scope.hideComposeFlyout();
        // send them to the url for that poll
        window.location = window.location.origin + window.location.pathname + '#/poll/?p=' + data.pid;
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
