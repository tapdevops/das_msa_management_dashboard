const oracledb = require('oracledb');
const dateformat = require('dateformat');

module.exports.get = async function get_data(query, res) {
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
        oracledb.fetchAsString = [ oracledb.CLOB ];
        result = await connection.execute( sql, binds, options );
        
        if (result) {
            // console.log(result);
            // result.rows.forEach(function(rs) {
            //     var obj = {};
            //     // console.log(rs);
            //     Object.keys(rs).forEach(function(key) {
            //         var val = rs[key];
            //         // console.log(typeof val, key, val);
            //         if(val == null){
            //             obj[key] = null;
            //         } else if(typeof val == 'object'){
            //             d = new Date(val);
            //             if (isNaN(d.getTime())) {
            //                 // date is not valid
            //                 obj[key] = val;
            //             } else {
            //                 // date is valid
            //                 obj[key] = dateformat(val, "yyyy-mm-dd HH:MM:ss")
            //             }
            //         } else {
            //             obj[key] = (val == null) ? '' : val;
            //         }
            //     });
            //     response.push(obj);
            // });
        }
        
        return result.rows;
    } catch ( err ) {
        return res.status(501).send( {
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

module.exports.getHeader = async function get_data(query, res) {
    let response = [], connection;
    try {
        let sql, binds, options, result;
        sql = query + ' WHERE rownum = 1';
        connection = await oracledb.getConnection( config.database );
        binds = {};
        options = {
            outFormat: oracledb.OUT_FORMAT_OBJECT
            // extendedMetaData: true,
            // fetchArraySize: 100
        };
        oracledb.fetchAsString = [ oracledb.CLOB ];
        result = await connection.execute( sql, binds, options );
        if (result) {
            
        }
        
        return result.metaData;
    } catch ( err ) {
        return res.status(501).send( {
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

module.exports.fetch = async function fetch_data(query, res, custom = '') {
    let response = [], connection;
    try {
        response = await module.exports.get(query, res);

        console.log(response.length);
        
        return res.send( {
            status: true,
            message: 'Success!!',
            data: response
        } )
    } catch ( err ) {
        console.log(err.message);
        throw err.message;
        return res.status(501).send( {
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

module.exports.fetchReturn = async function fetch_data(query, res, custom = '') {
    let response = [], connection;
    try {
        response = await module.exports.get(query, res);
        
        return response;
    } catch ( err ) {
        throw err.message;
        return res.status(501).send( {
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