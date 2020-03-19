module.exports = {
	dev: {
		user          : process.env.NODE_ORACLEDB_USER || "TAP_DW",
		password      : process.env.NODE_ORACLEDB_PASSWORD || "tapdw123#",
		connectString : process.env.NODE_ORACLEDB_CONNECTIONSTRING || "10.20.1.103:1521/tapdw"
	},
	qa: {
		user          : process.env.NODE_ORACLEDB_USER || "mobile_inspection",
		password      : process.env.NODE_ORACLEDB_PASSWORD || "mobile_inspection",
		connectString : process.env.NODE_ORACLEDB_CONNECTIONSTRING || "10.20.1.111:1521/tapapps"
	},
	prod: {
		user          : process.env.NODE_ORACLEDB_USER || "qa_user",
		password      : process.env.NODE_ORACLEDB_PASSWORD || "qa_user",
		connectString : process.env.NODE_ORACLEDB_CONNECTIONSTRING || "10.20.1.57:1521/tapdw"
	}
};



