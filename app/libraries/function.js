module.exports = async function fetch_data(query, res) {
    let response = [];
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
    }
}