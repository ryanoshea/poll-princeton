(function(){
angular.module('poll-princeton')

  .directive('navbar', function () {
    return {
      restrict: 'E',
      templateUrl: 'app/partials/snippets/navbar.html'
    }
  })

  .directive('ppfooter', function () {
    return {
      restrict: 'E',
      templateUrl: 'app/partials/snippets/footer.html'
    }
  })

  .directive('compose', function () {
    return {
      restrict: 'E',
      templateUrl: 'app/partials/snippets/compose-poll.html'
    }
  })

  .directive('auth', function () {
    return {
      restrict: 'E',
      templateUrl: 'app/partials/snippets/auth.html'
    }
  });

})();
