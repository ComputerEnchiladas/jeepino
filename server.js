process.env.NODE_URL='192.168.1.109'; // Default Port: 6085
#process.env.PORT=8000; // Change Port

// SERVO MOTOR SETUP
var five = require("johnny-five");
var board = new five.Board();
var servoX, servoY, posX = 90, posY = 90;
board.on("ready", function() {
  servoX = new five.Servo({pin:3, center: true, range: [60,120]});
  servoY = new five.Servo({pin: 5, center: true, range: [60, 120]});
  servoY.center(); servoX.center();
});

// GPIO CONTROL SETUP
var Gpio = require('onoff').Gpio;
var left = new Gpio(20, 'out')
  , right = new Gpio(21, 'out')
  , backward = new Gpio(19, 'out')
  , forward = new Gpio(26, 'out');
  
var resetTurn = function() {
  left.writeSync( 0 );
  right.writeSync( 0 );
}
var resetDirection = function () {
  backward.writeSync( 0 );
  forward.writeSync( 0 );
}
resetTurn(); resetDirection();

require('mahrio').runServer( process.env, __dirname ).then( function( server ) {

  server.route({ // SERVE SINGLE STATIC VIEW
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: {
        path: ['../public/']
      }
    }
  });

  // WEB SOCKETS SETUP & LISTENERS
  var io = require('socket.io').listen( server.listener );
  io.on('connection', function( socket ) {
    console.log('Socket Connected: ', socket.id );
    socket.emit('event:hello'); // WELCOME THE CONNECTION
  
    // BEGIN LISTENING FOR SOCKET MESSAGES FROM CLIENTS
    // LISTEN FOR SERVO MOTORS CONTROL COMMANDS FORWARDED TO JOHNNY-FIVE
    socket.on('cam:--', function(){ 
      servoY.center(); 
      servoX.center(); 
    });
    socket.on('cam:__', function(point){ 
      if( posX > 70 && posY < 120 ) {
        posX = posX + (point.x * 10)
      }
      if( posY > 70 && posY < 120 ) {
        posY = posY + (point.y * 10);
      }
      servoX.to(posX); servoY.to(posY); 
    });
 
    // DC MOTOR CONTROL AND/OR LINEAR ACTUATOR 
    socket.on('FWD-L', function(val){ // DC FORWARD & LEFT
      resetTurn();
      resetDirection();
      forward.writeSync( !!val ? 1 : 0 );
      left.writeSync( !!val ? 1 : 0 );
    });
    socket.on('FWD', function(val){ // DC FORWARD & CENTER
      resetTurn();
      resetDirection();
      forward.writeSync( !!val ? 1 : 0 )
    });
    socket.on('FWD-R', function(val){ // DC FORWARD & RIGHT
      resetTurn();
      resetDirection();
      forward.writeSync( !!val ? 1 : 0 );
      right.writeSync( !!val ? 1 : 0 );
    });
    socket.on('BWD-L', function(val){ // DC BACKWARDS & LEFT
      resetDirection();
      resetTurn();
      backward.writeSync( !!val ? 1 : 0 );
      left.writeSync( !!val ? 1 : 0 );
    });
    socket.on('BWD', function(val){ // DC BACKWARDS & CENTER
      resetDirection();
      resetTurn();
      backward.writeSync( !!val ? 1 : 0 );
    });
    socket.on('FWD-R', function(val){ // DC BACKWARDS & RIGHT
      resetDirection();
      resetTurn();
      backward.writeSync( !!val ? 1 : 0 );
      right.writeSync( !!val ? 1 : 0 );
    }); 
  });

  // SERVER CONNECTION SIGNAL
  var state = false;
  setInterval( function(){
    io.sockets.emit('event:led:state', state = !state );
  }, 1000);

  console.log('Server Ready...');
});
