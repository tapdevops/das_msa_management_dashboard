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

exports.fetchPostData = async (req, res) => {
    let name = req.params.name;
    let where = req.body.where_clause
    
    try {
        console.log(global.api);
        var api =  global.api.filter(function(api) {
            return api.name == name;
        });

        if(api.length > 0){
            var api_ = api[0];
            // run query to tap_dw
            var query = api_.query;
            if(where != undefined){
                if(query.toLowerCase().includes('where')){
                    query += ` AND `;
                }else{
                    query += ` WHERE `;
                }
                query += ` ${where} `;
            }

            console.log(query);

            functions.fetch(query, res);
        }else {
            return res.status(404).send({
                status: false, 
                message: 'API not found',
                data: []
            });
        }
    } catch(err) {
        console.log(err)
        return res.status(501).send({
            status: false, 
            message: "Internal server error",
            data: []
        });
    }
}

exports.fetchData = async (req, res) => {
    let name = req.params.name;
    let val = req.query.val;
    
    try {
        // console.log(global.api);
        var api =  global.api.filter(function(api) {
            return api.name == name;
        });

        if(api.length > 0){
            var api_ = api[0];
            // run query to tap_dw
            var query = api_.query;
            if(val != undefined){
                if(query.toLowerCase().includes('where')){
                    query += ` AND `;
                }else{
                    query += ` WHERE `;
                }
                query += ` ${api_.where_column} = '${val}' `;
            }

            functions.fetch(query, res);
        }else {
            return res.status(404).send({
                status: false, 
                message: 'API not found',
                data: []
            });
        }
    } catch(err) {
        console.log(err)
        return res.status(501).send({
            status: false, 
            message: "Internal server error",
            data: []
        });
    }
}