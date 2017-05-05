angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {
  $scope.buttonOn = function( dir ) {
    console.log( 'ON', dir);
    socket.emit( dir, 1);
  };
  $scope.buttonOff = function(dir){
    console.log( 'OFF', dir );
    socket.emit( dir, 0);
  }
})

.controller('ChatsCtrl', function($scope) {
  $scope.buttonOn = function( dir, point ) {
    console.log( 'ON', dir);
    socket.emit( dir, point);
  };
  $scope.buttonOff = function(dir){
    console.log( 'OFF', dir );
    socket.emit( dir, {x:0, y:0});
  }
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
