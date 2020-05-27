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

require('dotenv').config();

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
var io = socket.listen( Server );
io.origins('*:*');
io.set('origins', '*:*');

io.on('connection', function (socket) {
    socket.on( 'update_chart', function( data ) {
        io.sockets.emit( 'update_chart', {
            message: data 
        });
    });

    socket.on( 'refresh_cron', function( data ) {
        try {
            var i = global.api.map(function(api) {
                return api.name;
            }).indexOf(data.name);
    
            if(i == -1){
                global.api.push(data);
            }else{
                if(cron_job[data.name] != undefined)
                    cron_job[data.name].destroy();
                global.api[i] = data;
            }
    
            var q = new RegExp(/FROM[\n ]+[A-Z]+\.{1}[A-Z_]+/g);
            var mv = q.exec(data.query.toUpperCase())[0].replace('FROM', '').trim();
    
            if(data.cron != null){
                cron_job[data.name] = cron.schedule(data.cron, () => {
                    refresh_mv(mv);
                }, {
                    scheduled: true,
                    timezone: "Asia/Jakarta"
                }); 
            }
    
            io.sockets.emit( 'refresh_cron', {
                message: 'sukses'
            });
    
            console.log(global.api);
        } catch (error) {
            io.sockets.emit( 'refresh_error', {
                message: error
            });
        }
    });

    socket.on( 'delete_cron', function( data ) {
        var ids = global.api.map(function(api) {
            return api.id;
        });
        // console.log(ids, typeof(data));
        var i = ids.indexOf(parseInt(data));

        console.log(i);

        if(i == -1){
            // global.push(data);
        }else{
            if(cron_job[global.api[i].name] != undefined)
                cron_job[global.api[i].name].destroy();
            global.api.splice(i, 1);
        }

        io.sockets.emit( 'delete_cron', {
            message: 'sukses'
        });

        console.log(global.api, data);
    });

    socket.on( 'reload_cron', function( data ) {
        reload_api();
    });
});

var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit : 10, // default = 10
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_NAME,
    timezone: 'utc+7'
});

var cron_job = [];

const oracledb = require('oracledb');
var cron = require('node-cron');
const ip = require('ip');

async function refresh_mv(mv){
    let log, connection, sql;
    console.log(mv);
    try {
        let binds, options, result, connection;
        sql = `call dbms_mview.refresh('${mv}', 'C')`;
        connection = await oracledb.getConnection( config.database );
        binds = {};
        options = {
            outFormat: oracledb.OUT_FORMAT_OBJECT
        };
        
        result = await connection.execute( sql, binds, options );
        // console.log(result, result == {}, result.length);
        log = `Sukses || ${sql} || ${new Date} || ${ip.address()}`;
    } catch ( err ) {
        console.log(err);
        log = `Gagal || ${sql} || ${new Date} || ${ip.address()} || ${err}`;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }

    pool.getConnection(function(err, connection) {
        connection.query("insert into api_cron_logs(logs) values (?)", log, function (err, result, fields) {
            connection.release();
            if (err) throw err;
        });
    });
}

function reload_api(){
    try {
        pool.getConnection(function(err, connection) {
            connection.query("SELECT * FROM api", function (err, result, fields) {
                connection.release();
                if (err) throw err;
                if(result.length > 0){
                    global.api = result;

                    global.api.forEach(element => {
                        if(cron.validate(element.cron)){
                            var q = new RegExp(/FROM[\n ]+[A-Z]+\.{1}[A-Z_]+/g);
                            var mv = q.exec(element.query.toUpperCase())[0].replace('FROM', '').trim();
                            // console.log(cron_job[element.name]);
                            if(cron_job[element.name] != undefined){
                                cron_job[element.name].destroy();
                            }

                            cron_job[element.name] = cron.schedule(element.cron, () => {
                                refresh_mv(mv);
                            }, {
                                scheduled: true,
                                timezone: "Asia/Jakarta"
                            });
                        }
                    });
                }else {
                    console.log('reload api');
                    io.sockets.emit( 'refresh_error', {
                        message: 'no api'
                    });
                    reload_api();
                }
            });
        });
    }catch (err) {
        console.log(err, 'reload api');
        io.sockets.emit( 'refresh_error', {
            message: err
        });
        reload_api();
    }

    console.log('finish');
}

reload_api();

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

App.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

require( './routes/api.js' )( App );