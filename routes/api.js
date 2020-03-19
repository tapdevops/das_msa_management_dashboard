/*
 |--------------------------------------------------------------------------
 | Setup
 |--------------------------------------------------------------------------
 */
    //Controllers
    const Controllers = {
        v_1_0: {
            Test : require( _directory_base + '/app/v1.00/controllers/Test.js' ),
            TV3 : require( _directory_base + '/app/v1.00/controllers/TV3.js' ),
            API : require( _directory_base + '/app/v1.00/controllers/DasMapAPI.js' ),
        }
    }

    const cors = require('cors');

    var corsOptions = {
        origin: function (origin, callback) {
            callback(null, true)	
        }
    }
        
    module.exports = ( app ) => {

        /*
        |--------------------------------------------------------------------------
        | Welcome Message
        |--------------------------------------------------------------------------
        */
            app.get( '/', ( req, res ) => {
                return res.json( { 
                    application: {
                        name : 'Microservice Dashboard',
                        env : config.app.env,
                        port : config.app.port[config.app.env]
                    } 
                } )
            } );
            
        /*
        |--------------------------------------------------------------------------
        | Versi 1.0
        |--------------------------------------------------------------------------
        */
       //push data titik restan ke kafka
        app.get( '/api/v1.00/test/:id', cors(corsOptions), Controllers.v_1_0.Test.getData );

        app.get( '/getCompany', cors(corsOptions), Controllers.v_1_0.TV3.getCompany );
        app.get( '/getRainfall/:werks', cors(corsOptions), Controllers.v_1_0.TV3.getRainfall );
        app.get( '/getYield/:werks', cors(corsOptions), Controllers.v_1_0.TV3.getYield );
        app.get( '/getBJR/:werks', cors(corsOptions), Controllers.v_1_0.TV3.getBJR );

        app.get( '/getBlok/:blok', cors(corsOptions), Controllers.v_1_0.API.getBlok );
        app.get( '/getBA/:ba', cors(corsOptions), Controllers.v_1_0.API.getBA );
        app.get( '/getAFD/:afd', cors(corsOptions), Controllers.v_1_0.API.getAFD );
    }
