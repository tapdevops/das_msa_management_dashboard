/*
 |--------------------------------------------------------------------------
 | Setup
 |--------------------------------------------------------------------------
 */
    //Controllers
    const Controllers = {
        v_1_0: {
            // Test : require( _directory_base + '/app/v1.00/controllers/Test.js' ),
            TV3 : require( _directory_base + '/app/v1.00/controllers/TV3.js' ),
            Panen : require( _directory_base + '/app/v1.00/controllers/Panen.js' ),
            AVT : require( _directory_base + '/app/v1.00/controllers/ActVsTarget.js' ),
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
                        name : 'Microservice Dashboard Untuk DasMap',
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
       
        // app.get( '/api/v1.00/test/:id', cors(corsOptions), Controllers.v_1_0.Test.getData );

        app.get( '/getCompany', cors(corsOptions), Controllers.v_1_0.TV3.getCompany );
        app.get( '/getRainfall/:werks', cors(corsOptions), Controllers.v_1_0.TV3.getRainfall );
        app.get( '/getYield/:werks', cors(corsOptions), Controllers.v_1_0.TV3.getYield );
        app.get( '/getBJR/:werks', cors(corsOptions), Controllers.v_1_0.TV3.getBJR );

        app.get( '/v1/dataprodbyblok/:blok', cors(corsOptions), Controllers.v_1_0.Panen.getBlok );
        app.get( '/v1/dataprodbyba/:ba', cors(corsOptions), Controllers.v_1_0.Panen.getBA );
        app.get( '/v1/dataprodbyafd/:afd', cors(corsOptions), Controllers.v_1_0.Panen.getAFD );

        app.get( '/v1/mapavt/afd', cors(corsOptions), Controllers.v_1_0.AVT.getAFD );
        app.get( '/v1/mapavt/blok', cors(corsOptions), Controllers.v_1_0.AVT.getBlok );
        app.get( '/v1/mapavt/comp', cors(corsOptions), Controllers.v_1_0.AVT.getCompany );
        app.get( '/v1/mapavt/est', cors(corsOptions), Controllers.v_1_0.AVT.getEstate );
    }
