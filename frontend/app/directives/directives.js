(function(){
angular.module('poll-princeton')

  .directive('navbar', function () {
    return {
      restrict : 'E',
      templateUrl: 'app/partials/snippets/navbar.html'
    }
  });
})();
