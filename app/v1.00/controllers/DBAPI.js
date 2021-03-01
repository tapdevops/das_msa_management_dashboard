const oracledb = require('oracledb');
const dateformat = require('dateformat');
const NJWT = require('njwt');
const ExportToCsv = require('export-to-csv').ExportToCsv;
var functions = require(_directory_base + '/app/libraries/function.js');
var json2xlsx = require('node-json-xlsx');
const fs = require('fs');


var mysql = require('mysql');

var pool = mysql.createPool({
    connectionLimit: 10, // default = 10
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_NAME
});
var xl = require('excel4node');

exports.getEmployee = async (req, res) => {
    let comp = req.params.comp;
    var query = `SELECT * FROM (
        SELECT EMPLOYEE_FULLNAME || '|' || EMPLOYEE_EMAIL || '|' || EMPLOYEE_NIK || '|' || EMPLOYEE_POSITION AS EMPLOYEE_FULLNAME FROM TAP_DW.TM_EMPLOYEE_HRIS
        UNION ALL
        SELECT EMPLOYEE_NAME  || '|' ||  EMAIL || '|' || NIK || '|' || JOB_CODE FROM TAP_DW.TM_EMPLOYEE_SAP tes ) a `;
    // var query = `SELECT * FROM (
    //     SELECT EMPLOYEE_FULLNAME || '|' || EMPLOYEE_EMAIL AS EMPLOYEE_FULLNAME FROM TAP_DW.TM_EMPLOYEE_HRIS
    //     UNION ALL
    //     SELECT EMPLOYEE_NAME  || '|' ||  EMAIL FROM TAP_DW.TM_EMPLOYEE_SAP tes
    // ) a `;

    query += ` where upper(EMPLOYEE_FULLNAME) LIKE UPPER('%${req.query.name}%') and rownum <= 5`;

    // console.log(query);
    var emps = await functions.fetchReturn(query, res);
    emps = emps.rows.map(({ EMPLOYEE_FULLNAME }) => EMPLOYEE_FULLNAME)
    // console.log(emps);

    return res.send(emps)
}

exports.list = (req, res) => {
    var result = [];
    global.api.forEach(api => {
        result.push({
            name: api.name,
            description: api.description,
            where_column: api.where_column,
            url: 'http://' + process.env.HOST + 'v1/dbApi/' + api.name + '?val='
        })
    });

    result.push({
        name: 'download',
        description: 'Download all data per company, POST, {"type": "PRD","comp": "41"}',
        where_column: '',
        url: 'http://' + process.env.HOST + 'v1/download'
    });

    var detailperawatanIndex = result.findIndex(function (data) {
        return data.name == 'detailperawatan'
    });

    result[detailperawatanIndex] = {
        "name": "detailperawatan",
        "description": "Detail Perawatan Level Company, Estate, Afdeling, Block",
        "where_column": "PARAMETER",
        "url": 'http://' + process.env.HOST + 'v1/detailperawatan?val='
    }

    return res.send({
        status: true,
        message: 'Success!!',
        data: result
    })
}

exports.fetchPostData = async (req, res) => {
    let name = req.params.name;
    let where = req.body.where_clause;

    try {
        // console.log(where);
        var api = global.api.filter(function (api) {
            return api.name == name;
        });

        if (api.length > 0) {
            var api_ = api[0];
            // run query to tap_dw
            var query = api_.query;
            if (where != undefined) {
                if (where == '') {

                } else if (query.toLowerCase().includes('where')) {
                    query += ` AND `;
                } else {
                    query += ` WHERE `;
                }
                if(where.toLowerCase().replace(/\s{2,}/g, ' ').includes('werks like')){
                    var check = where.toLowerCase().replace(/\s{2,}/g, ' ');
                    var check = check.split(' ');
                    check.forEach((v,i) => {
                        if(v.includes('%')){
                            if(check[i-2]=='werks'){
                                var werks_length = v.replace(/[^0-9]/g,"").length;
                                query = query.replace("WERKS",`SUBSTR(WERKS,1,${werks_length})`);
                            }
                        }
                    });
                }
                query += ` ${where} `;
            }

            functions.fetch(query, res);
        } else {
            return res.status(404).send({
                status: false,
                message: 'API not found',
                data: []
            });
        }
    } catch (err) {
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
        var api = global.api.filter(function (api) {
            return api.name == name;
        });

        if (api.length > 0) {
            var api_ = api[0];
            // run query to tap_dw
            var query = api_.query;

            functions.getHeader(query, res);
        } else {
            return res.status(404).send({
                status: false,
                message: 'API not found',
                data: []
            });
        }
    } catch (err) {
        console.log(err)
        return res.status(501).send({
            status: false,
            message: "Internal server error",
            data: []
        });
    }
}

exports.fetchData = async (req, res) => {
    const { from, to } = req.query
    // console.log(from, to,'==> ini from , to');
    let name = req.params.name;
    let val = req.query.val;

    try {
        // console.log(global.api);
        var api = global.api.filter(function (api) {
            api.name == name?console.log(name):'';
            return api.name == name;
        });
        console.log(api);

        if (api.length > 0) {
            var api_ = api[0];
            var query = api_.query;

            if (val != undefined) {
                if (query.toLowerCase().includes('where')) {
                    query += ` AND `;
                } else {
                    query += ` WHERE `;
                }
                if (api_.name == 'chartProduksiDaily' && from != undefined && to!= undefined) {
                    query += ` ${api_.where_column} = '${val}' AND TANGGAL BETWEEN TO_CHAR(TO_DATE('${from}', 'YYYYMMDD'), 'YYYY-MM-DD') AND TO_CHAR(TO_DATE('${to}', 'YYYYMMDD'), 'YYYY-MM-DD') ORDER BY TANGGAL`;
                } else {
                    query += ` ${api_.where_column} = '${val}'`
                }

            }

            // console.log(query);

            functions.fetch(query, res);
        } else {
            return res.status(404).send({
                status: false,
                message: 'API not found',
                data: []
            });
        }
    } catch (err) {
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
    let query = '';

    // return res.send({
    //     status: false, 
    //     message: 'tes',
    //     data: [req.body.bulan, req.body.start]
    // });

    NJWT.verify(req.body._token, process.env.SECRET_KEY, process.env.TOKEN_ALGORITHM, (err, authData) => {
        if (err) {
            res.status(401).send({
                status: false,
                message: "Invalid Token",
                data: err
            });
        }
    });

    try {
        // console.log(global.api);
        let sql, binds, options, result;
        sql = query;
        connection = await oracledb.getConnection(config.database);
        binds = {};
        options = {
            outFormat: oracledb.OUT_FORMAT_OBJECT
            // extendedMetaData: true,
            // fetchArraySize: 100
        };

        var api = global.api.filter(function (api) {
            return api.name == name;
        });

        if (api.length > 0) {
            var api_ = api[0];
            // run query to tap_dw
            query = api_.query;

            var $param = "";

            if (req.body.bulan == null) {
                $param = " WHERE TANGGAL >= TO_DATE('" + req.body.start + "', 'DD-Month-YYYY') AND TANGGAL <= TO_DATE('" + req.body.end + "', 'DD-Month-YYYY') ";
            } else {
                $param = " WHERE TANGGAL = '" + req.body.bulan + "' ";
            }

            var $comp = req.body.comp;
            var $est = req.body.est;
            var $afd = req.body.afd;
            var $blk = req.body.blk;
            var role = req.body.role;
            var loc = req.body.loc;
            var region = req.body.region;
            if (region != 'all') {
                if ($comp != 'all') {
                    if ($est != 'all') {
                        if ($afd != 'all') {
                            $param += " AND ID_AFD = '" + $afd + "'";
                        }

                        $param += " AND ID_BA = '" + $comp + $est + "'";
                    } else {
                        $param += " AND ID_CC = '" + $comp + "'";
                    }
                } else {
                    $param += " AND ID_REG = '" + region + "'";
                }
            }

            query += $param;

            var locs = loc.split(',');
            var locString = "'" + locs.join("','") + "'";
            if (role == 'AFD_CODE') {
                query += ` AND ID_BA||ID_AFD in (${locString.replace(/ /g, "")}) `;
            } else if (role == 'BA_CODE') {
                query += ` AND ID_BA in (${locString.replace(/ /g, "")}) `;
            } else if (role == 'COMP_CODE') {
                query += ` AND ID_CC in (${locString.replace(/ /g, "")}) `;
            } else if (role == 'REGION_CODE') {
                query += ` AND ID_REG in (${locString.replace(/ /g, "")}) `;
            }

            var datas = await functions.fetchReturn(query, res);
            // console.log(query);
            console.log(datas.rows.length);

            if (datas.rows.length == 0) {
                pool.getConnection(function (err, connection) {
                    connection.query("INSERT into report_logs (`user`, api, query, status) values (?, ?, ?, ?)", [req.body.nama, name, query, 'no data'], function (err, result, fields) {
                        connection.release();
                        if (err) throw err;
                    });
                });
                res.set('Content-Type', 'text/html');
                res.send(new Buffer('<script>alert("No data acquired..");window.close();</script>'));
                return;
            }

            var header = datas.metaData.map(function (col) {
                return col.name
            });

            const opts = {
                fieldSeparator: ';',
                quoteStrings: '"',
                decimalSeparator: ',',
                showLabels: true,
                showTitle: true,
                // title: 'One Click Report',
                useTextFile: false,
                useBom: true,
                useKeysAsHeaders: false,
                headers: header
            };

            const csvExporter = new ExportToCsv(opts);
            pool.getConnection(function (err, connection) {
                connection.query("INSERT into report_logs (`user`, api, query, status) values (?, ?, ?, ?)", [req.body.nama, name, query, 'sukses'], function (err, result, fields) {
                    connection.release();
                    if (err) throw err;
                });
            });
            res.setHeader('Content-disposition', 'attachment; filename=' + name + '.csv');
            res.set('Content-Type', 'text/csv');
            res.send(csvExporter.generateCsv(datas.rows, true));
        } else {
            return res.status(404).send({
                status: false,
                message: 'API not found',
                data: []
            });
        }
    } catch (err) {
        console.log(err);
        pool.getConnection(function (err, connection) {
            connection.query("INSERT into report_logs (`user`, api, query, status) values (?, ?, ?, ?)", [req.body.nama, name, query, 'error'], function (err, result, fields) {
                connection.release();
                if (err) throw err;
                return res.status(501).send({
                    status: false,
                    message: "Internal server error, please try again",
                    data: err
                });
            });
        });

    }
}