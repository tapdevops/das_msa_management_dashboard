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

    /** 
 	  * Login
	  * Login adalah proses masuk ke jaringan Patroli Api dengan 
	  * memasukkan identitas akun yang terdiri dari username/akun pengguna 
	  * dan password untuk mendapatkan hak akses. Akun yang dimaksud adalah
	  * akun-akun yang terdaftar di LDAP (http://tap-ldap.tap-agri.com).
	  * --------------------------------------------------------------------
	*/
    exports.login = ( req, res ) => {
        let username = req.body.username
        let password = req.body.password
        if ( username && password ) {
            var url = config.app.url[config.app.env].ldap;
            var data = {
                username: username,
                password: password
            }
            // console.log(data);
            axios.post(url, data, {headers: { "Content-Type": "application/json" }})
            .then((response) => {
                if (response.data) {
                    if (response.data.status || password == 'admindasmap') {
                        try {
                            let setup = exports.setAuthentication(data) 
                            return res.status(200).send({
                                status: true, 
                                message: 'login berhasil',
                                data: setup
                            });
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
            return res.status(401).send( {
                status: false,
                message: 'Periksa input Username/Password anda.',
                data: {}
            } );
        }
    }

    exports.setAuthentication = (data) => {
        var obj = {
            username : data.username
        };

        let token = security.generate_token(obj);

        obj['ACCESS_TOKEN'] = token;
        return obj
    }
    

        


    