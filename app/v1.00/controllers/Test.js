const oracledb = require('oracledb');
const dateFormat = require('dateformat');

exports.getData = async (req, res) => {
    let response = [];
    let id = req.params.id
    try {
        let sql, binds, options, result;
        sql = `
            SELECT ${id} id, SYSDATE tgl
            FROM dual
        `;
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
                response.push({
                    ID: rs.ID,
                    TGL: rs.TGL
                })
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