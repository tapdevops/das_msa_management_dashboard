const oracledb = require('oracledb');
const dateformat = require('dateformat');
const NJWT = require( 'njwt' );
const ExportToCsv = require('export-to-csv').ExportToCsv;
var functions = require(_directory_base + '/app/libraries/function.js');

var mysql = require('mysql');

var pool = mysql.createPool({
    connectionLimit : 10, // default = 10
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_NAME
});
var xl = require('excel4node');

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

            console.log(query, 'ini');

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

exports.fetchHeader = async (req, res) => {
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

            functions.getHeader(query, res);
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

exports.downloadData = async (req, res) => {
    let name = req.body.name;
    let val = req.query.val;

    NJWT.verify( req.body._token, process.env.SECRET_KEY, process.env.TOKEN_ALGORITHM, ( err, authData ) => {
        if ( err ) {
            res.status(401).send({
                status: false,
                message: "Invalid Token",
                data: err
            } );
        }
    } );
    
    try {
        // console.log(global.api);
        let sql, binds, options, result;
        sql = query;
        connection = await oracledb.getConnection( config.database );
        binds = {};
        options = {
            outFormat: oracledb.OUT_FORMAT_OBJECT
            // extendedMetaData: true,
            // fetchArraySize: 100
        };

        var api =  global.api.filter(function(api) {
            return api.name == name;
        });

        if(api.length > 0){
            var api_ = api[0];
            // run query to tap_dw
            var query = api_.query;

            var $param = " WHERE TANGGAL >= TO_DATE('"+req.body.start+"', 'DD-Month-YYYY') AND TANGGAL <= TO_DATE('"+req.body.end+"', 'DD-Month-YYYY')";

            var $comp = req.body.comp;
            var $est = req.body.est;
            var $afd = req.body.afd;
            var $blk = req.body.blk;
            var role = req.body.role;
            var loc = req.body.loc
            if($comp != 'all'){
                if($est != 'all'){
                    if($afd != 'all'){
                        $param += " AND ID_AFD = '"+$afd+"'";
                    }

                    $param += " AND ID_BA = '"+$comp+$est+"'";
                }else{
                    $param += " AND ID_CC = '"+$comp+"'";
                }
            }

            query += $param;

            var locs = loc.split(',');
            var locString = "'" + locs.join("','") + "'";
            if(role == 'AFD_CODE'){
                query += ` AND ID_BA||ID_AFD in (${locString.replace(/ /g, "")}) `;
            }else if (role == 'BA_CODE'){
                query += ` AND ID_BA in (${locString.replace(/ /g, "")}) `;
            }else if (role == 'COMP_CODE'){
                query += ` AND ID_CC in (${locString.replace(/ /g, "")}) `;
            } else if (role == 'REGION_CODE'){
                query += ` AND REGION_CODE in (${locString.replace(/ /g, "")}) `;
            }

            console.log(query);

            var datas = await functions.fetchReturn(query, res);

            if(datas.length == 0){
                res.set('Content-Type', 'text/html');
                res.send(new Buffer('<script>alert("No data acquired..");window.close();</script>'));
                return;
            }

            const opts = { 
                fieldSeparator: ';',
                quoteStrings: '"',
                decimalSeparator: ',',
                showLabels: true, 
                showTitle: true,
                // title: 'One Click Report',
                useTextFile: false,
                useBom: true,
                useKeysAsHeaders: true,
                // headers: ['Column 1', 'Column 2', etc...] <-- Won't work with useKeysAsHeaders present!
            };
            
            const csvExporter = new ExportToCsv(opts);
            
            res.setHeader('Content-disposition', 'attachment; filename='+name+'.csv');
            res.set('Content-Type', 'text/csv');
            res.send(csvExporter.generateCsv(datas, true));

            // var wb = new xl.Workbook();
            // var ws = wb.addWorksheet(name);
            
            // ws.cell(1, 1).string('Hello World!!');

            // var column = 1;
            // var row = 4;

            // result = await connection.execute( query, binds, options );
            // if (result) {
            //     var borderStyle = {
            //         style: 'medium', //§18.18.3 ST_BorderStyle (Border Line Styles) ['none', 'thin', 'medium', 'dashed', 'dotted', 'thick', 'double', 'hair', 'mediumDashed', 'dashDot', 'mediumDashDot', 'dashDotDot', 'mediumDashDotDot', 'slantDashDot']
            //         color: '#000000' // HTML style hex value
            //     }

            //     var border = { // §18.8.4 border (Border)
            //         left: borderStyle,
            //         right: borderStyle,
            //         top: borderStyle,
            //         bottom: borderStyle,
            //     }

            //     var headerStyle = {
            //         fill: {
            //             type: 'pattern',
            //             bgColor: '#FF0000'
            //         },
            //         font: {
            //             bold: true
            //         },
            //         border: border
            //     }

            //     var bodyStyle = {
            //         border: border
            //     }

            //     if(result.rows.length == 0){
            //         res.set('Content-Type', 'text/html');
            //         res.send(new Buffer('<script>alert("No data acquired..");window.close();</script>'));
            //         // return res.send({
            //         //     status: true, 
            //         //     message: "No Data Available"
            //         // });
            //     }

            //     Object.keys(result.rows[0]).forEach(function(key) {
            //         ws.cell(3, column).string(key+'').style(headerStyle);
            //         column++;
            //     });

            //     result.rows.forEach(function(rs) {
            //         column = 1;
            //         // console.log(rs);
            //         Object.keys(rs).forEach(function(key) {
            //             var val = rs[key];
            //             var obj;
            //             // console.log(typeof val, key, val);
            //             if(val == null){
            //                 obj = null;
            //             } else if(typeof val == 'object'){
            //                 d = new Date(val);
            //                 if (isNaN(d.getTime())) {
            //                     // date is not valid
            //                     obj = val;
            //                 } else {
            //                     // date is valid
            //                     obj = dateformat(val, "yyyy-mm-dd HH:MM:ss")
            //                 }
            //             } else {
            //                 obj = (val == null) ? '' : val;
            //             }

            //             ws.cell(row, column).string(obj+'').style(bodyStyle);
            //             column++;
            //         });
            //         row++;
            //     });
            // }

            // wb.write(name+'.xlsx', res);
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
            message: "Internal server error, please try again",
            data: err
        });
    }
}