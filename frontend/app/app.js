(function(){

var app = angular.module('poll-princeton', [
  'ngRoute',
  'poll-princeton.controllers'//,
  //'poll-princeton.services'
]);

var cont = angular.module('poll-princeton.controllers', [ ]);
//var serv = angular.module('poll-princeton.services', [ ]);

app.config(function ($routeProvider) {

  // configure view routing
  $routeProvider
    .when('/', {
      controller: 'loginController',
      templateUrl: 'app/partials/login.html'
    })
    .when('/feed', {
      controller: 'feedController',
      templateUrl: 'app/partials/feed.html'
    })
    .when('/poll', {
      controller: 'pollController',
      templateUrl: 'app/partials/poll.html'
    })
    /*.when('/edit', {
      controller: 'editListingController',
      templateUrl: 'app/partials/edit-listing.html',
      resolve: {
        user: function(Authentication) {
          return Authentication.getUser();
        }
      }
    })*/
    .otherwise({
      redirectTo: '/'
    });

});

})();
