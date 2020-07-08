const oracledb = require('oracledb');
var functions = require(_directory_base + '/app/libraries/function.js');
var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit : 10, // default = 10
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_NAME,
    timezone: 'utc+7'
});

exports.downloadAll = async (req, res) => {
    var result = {};
    var type = req.body.type;
    var comp = req.body.comp;
    try {
        pool.getConnection(function(err, connection) {
            connection.query("SELECT group_concat(map_type) tipe from map_type mt where menu = ?", type, async function (err, response, fields) {
                connection.release();
                if (err) throw err;

                result['mapcolor'] = await functions.get(`
                    SELECT PARAMETER AS "PARAMETER_2", PARAMETER_2 AS "PARAMETER", COMPANY_CODE, NAME, MAP_COLOR
                    FROM RIZKI.DAS_MAP_COLOR_MV
                    WHERE company_code = ${comp}
                    AND SUBSTR(PARAMETER, INSTR(PARAMETER, '||') + 2) IN (${response[0].tipe})
                `, res);
                
                if(type == 'PRD'){
                    
                }else {
                    
                }

                result['detailrotasipanen'] = await functions.get('SELECT * FROM RIZKI.DAS_DET_ROTASI_PANEN_MV WHERE company_code = ' + comp, res);
                result['detailperawatan'] = await functions.get('SELECT * FROM RIZKI.DAS_DETAIL_PERAWATAN_MV WHERE company_code = ' + comp, res);
                
                return res.send( {
                    status: true,
                    message: 'Success!!',
                    data: result
                } )
            });
        });
    } catch(err) {
        console.log(err)
        return res.status(501).send({
            status: false, 
            message: "Internal server error",
            data: err
        });
    }
}