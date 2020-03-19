/*
|--------------------------------------------------------------------------
| Global APP Init
|--------------------------------------------------------------------------
*/
process.env.ORA_SDTZ = 'UTC';
global._directory_base = __dirname;
global.config = {};
    config.app = require( './config/app.js' );
    config.database = require( './config/database.js' )[config.app.env];


/*
|--------------------------------------------------------------------------
| APP Setup
|--------------------------------------------------------------------------
*/
// Node Modules
const BodyParser = require( 'body-parser' );
const Express = require( 'express' );
const App = Express();

var fs = require('fs');
var socket  = require( 'socket.io' );
const cors = require('cors');

var options = {
    // key: fs.readFileSync('/etc/letsencrypt/live/pabgroup.co.id/privkey.pem'),
    // cert: fs.readFileSync('/etc/letsencrypt/live/pabgroup.co.id/fullchain.pem')
};

/*
|--------------------------------------------------------------------------
| APP Init
|--------------------------------------------------------------------------
*/
// Parse request of content-type - application/x-www-form-urlencoded
App.use( BodyParser.urlencoded( { extended: false } ) );

// Parse request of content-type - application/json
App.use( BodyParser.json() );

App.use(cors());


// Server Running Message
var Server = App.listen( parseInt( config.app.port[config.app.env] ), () => {
    console.log( 'Server' );
    console.log( "\tStatus \t\t: OK" );
    console.log( "\tService \t: " + config.app.name + " (" + config.app.env + ")" );
    console.log( "\tPort \t\t: " + config.app.port[config.app.env] );

    console.log("Database");
    console.log( "\tDB Server \t: " + config.database.connectString + " (" + config.app.env + ")" );
} );

// var server  = require('http').createServer(options, App);
var io      = socket.listen( Server );
io.origins('*:*');
io.set('origins', '*:*');
// // var port    = process.env.PORT || 3000;

// server.listen(parseInt( config.app.port[config.app.env] ), function () {
//     console.log('Server listening at port %d', port);
// });

io.on('connection', function (socket) {

    socket.on( 'update_chart', function( data ) {
      io.sockets.emit( 'update_chart', {
          message: data 
      });
    });
});

setInterval(function () { 
    io.sockets.emit( 'slide', (new Date().getHours() * 60 + new Date().getMinutes()) % 17);
}, 60 * 1000);
/*
|--------------------------------------------------------------------------
| Routing
|--------------------------------------------------------------------------
*/
require( './routes/api.js' )( App );
