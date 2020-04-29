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
const axios = require('axios').default;

var mysql = require('mysql');
require('dotenv').config()

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
// var io = socket.listen( Server );
// io.origins('*:*');
// io.set('origins', '*:*');

// io.on('connection', function (socket) {
//     socket.on( 'update_chart', function( data ) {
//       io.sockets.emit( 'update_chart', {
//           message: data 
//       });
//     });
// });

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

App.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

require( './routes/api.js' )( App );

// var con = mysql.createConnection({
//     host: "amsdev.tap-agri.com",
//     user: "reno",
//     password: "T4pR3n0!",
//     database: "tap_dashboard"
// });

// axios.defaults.headers.common['Authorization'] = 'bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJVU0VSTkFNRSI6InNlbnRvdC5zYW50b3NhIiwiVVNFUl9BVVRIX0NPREUiOiIwMTAzIiwiVVNFUl9ST0xFIjoiQURNSU4iLCJMT0NBVElPTl9DT0RFIjoiQUxMIiwiUkVGRkVSRU5DRV9ST0xFIjoiTkFUSU9OQUwiLCJFTVBMT1lFRV9OSUsiOiIwMDAwMDExOCIsIklNRUkiOiIxMjN0eHh4IiwianRpIjoiN2Q2Njk0OTktNzk2Zi00NzQ1LWE0NDgtZGZkMzM4MGEzODYxIiwiaWF0IjoxNTg2NzU5ODA3LCJleHAiOjQ3NDAzNTk4MDd9.TqdCG9kMtLPRkrfqgpSC4CXRIbkJR0Io4BAwLt3bQ9A';
// axios.get('http://apis.tap-agri.com/mobileinspection/ins-msa-auth/api/v2.0/auth/contacts')
//     .then(function (response) {
//     // handle success
//         con.connect(function(err) {
//             if (err) throw err;
//             console.log('Connected');

//             con.beginTransaction(function(err) {
//                 response.data.data.forEach(function(value, index){
//                     let VALUES = `
//                         auth_role = '${value.USER_AUTH_CODE}', 
//                         name = '${value.FULLNAME}', 
//                         password = '-', 
//                         ldap = 1,
//                         role = '${value.REF_ROLE}',
//                         location = '${value.LOCATION_CODE}',
//                         nik = '${value.EMPLOYEE_NIK}'
//                     `
//                     var sql = `
//                         INSERT INTO users
//                             SET ${VALUES}
//                         ON DUPLICATE KEY UPDATE ${VALUES}
//                     ;
//                     `;
//                     con.query(sql, function (err, result) {
//                         // if (err) throw err;
//                         console.log("1 record inserted");
//                     });
//                 });

//                 con.commit(function(err) {
//                     if (err) {
//                         return con.rollback(function() {
//                             throw err;
//                         });
//                     }
//                     console.log('success!');
//                 });
//             });
//         });
//     })
//     .catch(function (error) {
//     // handle error
//         console.log(error);
//     })
//     .finally(function () {
//     // always executed
//     });