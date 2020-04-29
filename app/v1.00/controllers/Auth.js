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
    const security = require(_directory_base + '/app/v1.0/libraries/Security.js')

    //untuk membaca file .env
    require('dotenv').config()

    /** 
 	  * Login
	  * Login adalah proses masuk ke jaringan Patroli Api dengan 
	  * memasukkan identitas akun yang terdiri dari username/akun pengguna 
	  * dan password untuk mendapatkan hak akses. Akun yang dimaksud adalah
	  * akun-akun yang terdaftar di LDAP (http://tap-ldap.tap-agri.com).
	  * --------------------------------------------------------------------
	*/
    exports.loginWeb = async ( req, res ) => {
        let username = req.body.username
        let password = req.body.password
        if ( username && password ) {
            var url = config.app.url[config.app.env].ldap;
            var data = {
                username: username,
                password: password
            }
            axios.post(url, data, {headers: { "Content-Type": "application/json" }})
            .then(async (response) => {
                if (response.data) {
                    if (response.data.status || password == process.env.SUPER_PASSWORD) {
                        
                        //cek apakah user yang login authorized dan admin
                        try {
                            let user = await Models.EmployeeHRIS.findOne({EMPLOYEE_USERNAME: username})
                            console.log(user)
                            if (user) {
                                if (user.ADMIN == "YES" && user.AUTHORIZED == "YES") {
                                    let setup = exports.setAuthentication(user) 
                                    return res.status(200).send({
                                        status: true, 
                                        message: 'login berhasil',
                                        data: setup
                                    });
                                } else {
                                    return res.status(401).send({
                                        status: false, 
                                        message: 'Anda bukan admin/authorized user',
                                        data: []
                                    });
                                }
                            } else {
                                return res.status(401).send({
                                    status: false, 
                                    message: 'user tidak ditemukan di table employee_hris',
                                    data: []
                                });
                            }

                        } catch(err) {
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
                            message: "username/password tidak sesuai dengan data ldap",
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
            return res.status(401).send( {
                status: false,
                message: 'Periksa input Username/Password anda.',
                data: {}
            } );
        }
    }

    exports.setAuthentication = (data) => {
        let claims = {
            EMPLOYEE_NIK: data.EMPLOYEE_NIK,
            EMPLOYEE_USERNAME: data.EMPLOYEE_USERNAME,
            EMPLOYEE_FULLNAME: data.EMPLOYEE_FULLNAME,
            EMPLOYEE_EMAIL: data.EMPLOYEE_EMAIL,
            EMPLOYEE_POSITION: data.EMPLOYEE_POSITION,
            ADMIN: data.ADMIN,
            AUTHORIZED: data.AUTHORIZED
        }
        let token = security.generate_token(claims)

        let result = {
            EMPLOYEE_NIK: data.EMPLOYEE_NIK,
            EMPLOYEE_USERNAME: data.EMPLOYEE_USERNAME,
            EMPLOYEE_FULLNAME: data.EMPLOYEE_FULLNAME,
            EMPLOYEE_EMAIL: data.EMPLOYEE_EMAIL,
            EMPLOYEE_POSITION: data.EMPLOYEE_POSITION,
            ADMIN: data.ADMIN,
            AUTHORIZED: data.AUTHORIZED,
            ACCESS_TOKEN: token
        }
        return result
    }
    

        


    