require('dotenv').config()
module.exports = {
	dev: {
		user          : process.env.NODE_ORACLEDB_USER,
		password      : process.env.NODE_ORACLEDB_PASSWORD,
		connectString : process.env.NODE_ORACLEDB_CONNECTIONSTRING
	},
	prod: {
		user          : process.env.NODE_ORACLEDB_USER,
		password      : process.env.NODE_ORACLEDB_PASSWORD,
		connectString : process.env.NODE_ORACLEDB_CONNECTIONSTRING
	}
};



