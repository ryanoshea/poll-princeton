(function(){
angular.module('poll-princeton')

  .directive('navbar', function () {
    return {
      restrict: 'E',
      templateUrl: 'app/partials/snippets/navbar.html'
    }
  })

  .directive('compose', function () {
    return {
      restrict: 'E',
      templateUrl: 'app/partials/snippets/compose-poll.html'
    }
  });

})();
