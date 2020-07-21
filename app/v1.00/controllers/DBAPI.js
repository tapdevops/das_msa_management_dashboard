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

exports.list = (req, res) => {
    var result = [];
    global.api.forEach(api => {
        result.push({
            name : api.name,
            description : api.description,
            where_column : api.where_column,
            url : 'http://' + process.env.HOST + 'v1/dbApi/' + api.name + '?val='
        })
    });

    result.push({
        name : 'download',
        description : 'Download all data per company, POST, {"type": "PRD","comp": "41"}',
        where_column : '',
        url : 'http://' + process.env.HOST + 'v1/download'
    });

    var detailperawatanIndex = result.findIndex(function(data){
        return data.name == 'detailperawatan'
    });

    result[detailperawatanIndex] = {
        "name": "detailperawatan",
        "description": "Detail Perawatan Level Company, Estate, Afdeling, Block",
        "where_column": "PARAMETER",
        "url" : 'http://' + process.env.HOST + 'v1/detailperawatan?val='
    }

    return res.send( {
        status: true,
        message: 'Success!!',
        data: result
    } )
}

exports.fetchPostData = async (req, res) => {
    let name = req.params.name;
    let where = req.body.where_clause;
    
    try {
        // console.log(where);
        var api =  global.api.filter(function(api) {
            return api.name == name;
        });

        if(api.length > 0){
            var api_ = api[0];
            // run query to tap_dw
            var query = api_.query;
            if(where != undefined){
                if(where == ''){

                }else if(query.toLowerCase().includes('where')){
                    query += ` AND `;
                }else{
                    query += ` WHERE `;
                }
                query += ` ${where} `;
            }

            // console.log(query, 'ini');

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