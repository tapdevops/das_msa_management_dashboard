const oracledb = require('oracledb');
var functions = require(_directory_base + '/app/libraries/function.js');


var mysql = require('mysql');

var pool = mysql.createPool({
    connectionLimit : 10, // default = 10
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_NAME
});

exports.fetchData = async (req, res) => {
    let name = req.params.name;
    let val = req.query.val;
    try {
        pool.getConnection(function(err, connection) {
            if (err) throw err;
            // get api from mysql
            connection.query("SELECT * FROM api where name = ?", [name], function (err, result, fields) {
                connection.release();
                if (err) throw err;
                if(result.length > 0){
                    var api = result[0];
                    // run query to tap_dw
                    var query = api.query;
                    if(val != undefined){
                        if(query.toLowerCase().includes('where')){
                            query += ` AND `;
                        }else{
                            query += ` WHERE `;
                        }
                        query += ` ${api.where_column} = '${val}' `;
                    }

                    functions.fetch(query, res);
                }else {
                    return res.status(401).send({
                        status: false, 
                        message: 'API not found',
                        data: []
                    });
                }
            });
        });
    } catch(err) {
        console.log(err)
        return res.status(501).send({
            status: false, 
            message: "Internal server error",
            data: []
        });
    }
}