const oracledb = require('oracledb');
const dateFormat = require('dateformat');

async function fetch_data(query, res) {
    let response = [], connection;
    try {
        let sql, binds, options, result;
        sql = query;
        connection = await oracledb.getConnection( config.database );
        binds = {};
        options = {
            outFormat: oracledb.OUT_FORMAT_OBJECT
            // extendedMetaData: true,
            // fetchArraySize: 100
        };
        result = await connection.execute( sql, binds, options );
        if (result) {
            result.rows.forEach(function(rs) {
                var obj = {};
                Object.keys(rs).forEach(function(key) {
                    var val = rs[key];
                    obj[key] = (val == null) ? 0 : val;
                    
                });
                response.push(obj);
            })
        }
        return res.send( {
            status: true,
            message: 'Success!!',
            data: response
        } )
    } catch ( err ) {
        return res.send( {
            status: false,
            message: err.message,
            data: []
        } );
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}

exports.getCompany = async (req, res) => {
    sql = `
        SELECT DISTINCT COMP_NAME COMP_DESC, WERKS COMP_CODE
            FROM TAP_DW.DASHBOARD_BOD_HARI_INI
        WHERE COMP_CODE NOT LIKE '3%' AND COMP_CODE <> '65' AND LENGTH(WERKS) = 4
        ORDER BY WERKS
        `;
    fetch_data(sql, res);
}

exports.getYield = async (req, res) => {
    let werks = req.params.werks;
    let query = `SELECT to_char(SPMON,'Mon') label, NVL(YIELD, 0) "${new Date().getFullYear()}", NVL(YIELD_THN_LALU, 0) "${new Date().getFullYear() - 1}"
    FROM TAP_DW.DASHBOARD_BOD_BULANAN
    WHERE WERKS = ${werks}
    ORDER BY SPMON`;
    fetch_data(query, res);
}

exports.getRainfall = async (req, res) => {
    let werks = req.params.werks;
    let sql = `
        SELECT MTD_CURAH_HUJAN, MTD_HARI_HUJAN, YTD_CURAH_HUJAN, YTD_HARI_HUJAN, WD, CURAH_HUJAN FROM TAP_DW.DASHBOARD_BOD_HARI_INI dbhi WHERE werks = ${werks}
    `;

    fetch_data(sql, res);    
}

exports.getBJR = async (req, res) => {
    let response = [];
    let werks = req.params.werks;
    let sql = `
        SELECT to_char(SPMON_BJR,'Mon') LABEL, NVL(BJR, 0) SLE
        FROM TAP_DW.DASHBOARD_BOD_BJR
        WHERE WERKS = ${werks}
        ORDER BY SPMON_BJR
    `;

    fetch_data(sql, res);    
}