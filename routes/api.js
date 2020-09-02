/*
 |--------------------------------------------------------------------------
 | Setup
 |--------------------------------------------------------------------------
 */
    //Controllers
    const Controllers = {
        v_1_0: {
            Auth : require( _directory_base + '/app/v1.00/controllers/Auth.js' ),
            Geojson: require(_directory_base + '/app/v1.00/controllers/DasmapGeo.js'),
            DBApi: require(_directory_base + '/app/v1.00/controllers/DBAPI.js'),
            DL: require(_directory_base + '/app/v1.00/controllers/Download.js'),
            TV3 : require( _directory_base + '/app/v1.00/controllers/TV3.js' ),
            Panen : require( _directory_base + '/app/v1.00/controllers/Panen.js' ),
            AVT : require( _directory_base + '/app/v1.00/controllers/ActVSTarget.js' ),
            JT : require( _directory_base + '/app/v1.00/controllers/JumlahTonase.js' ),
            HK : require( _directory_base + '/app/v1.00/controllers/TonaseHK.js' ),
            PT : require( _directory_base + '/app/v1.00/controllers/ProgressTanam.js' ),
            I : require( _directory_base + '/app/v1.00/controllers/Inspeksi.js' ),
        }
    }

    const VerifyToken =  require(_directory_base + '/app/libraries/VerifyToken.js');

    const cors = require('cors');

    var corsOptions = {
        origin: function (origin, callback) {
            callback(null, true)	
        }
    }

    var middleware = {
        VerifyToken : VerifyToken,
        cors : [VerifyToken, cors(corsOptions)]
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
                        name : 'Microservice Dashboard Panen',
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
       
        // app.get( '/api/v1.00/test/:id', [VerifyToken, cors(corsOptions)], Controllers.v_1_0.Test.getData );

        /*app.get( '/getCompany', [VerifyToken, cors(corsOptions)], Controllers.v_1_0.TV3.getCompany );
        app.get( '/getRainfall/:werks', [VerifyToken, cors(corsOptions)], Controllers.v_1_0.TV3.getRainfall );
        app.get( '/getYield/:werks', [VerifyToken, cors(corsOptions)], Controllers.v_1_0.TV3.getYield );
        app.get( '/getBJR/:werks', [VerifyToken, cors(corsOptions)], Controllers.v_1_0.TV3.getBJR );*/

        app.post('/v1/login', cors(corsOptions), Controllers.v_1_0.Auth.login);
        app.get('/v1/serviceList', [VerifyToken, cors(corsOptions)], Controllers.v_1_0.DBApi.list);

        app.get('/v1/getGeojson', [VerifyToken, cors(corsOptions)], Controllers.v_1_0.Geojson.parse_geojson);
        app.get( '/v1/dbApi/:name', [VerifyToken, cors(corsOptions)], Controllers.v_1_0.DBApi.fetchData);
        app.get( '/v1/detailperawatan', [cors(corsOptions)], Controllers.v_1_0.DL.downloadPerawatan);

        app.post( '/v1/downloadCSV', [cors(corsOptions)], Controllers.v_1_0.DBApi.downloadData);
        
        app.post( '/v1/dbApi/:name', [VerifyToken, cors(corsOptions)], Controllers.v_1_0.DBApi.fetchPostData);
        app.post( '/v1/download', [cors(corsOptions)], Controllers.v_1_0.DL.downloadAll);

        app.get( '/v1/dataprodbyblok/:blok', [VerifyToken, cors(corsOptions)], Controllers.v_1_0.Panen.getBlok );
        app.get( '/v1/dataprodbyba/:ba', [VerifyToken, cors(corsOptions)], Controllers.v_1_0.Panen.getBA );
        app.get( '/v1/dataprodbyafd/:afd', [VerifyToken, cors(corsOptions)], Controllers.v_1_0.Panen.getAFD );

        app.get( '/v1/mapavtbyafd/:comp', [VerifyToken, cors(corsOptions)], Controllers.v_1_0.AVT.getAFD );
        app.get( '/v1/mapavtbyblok/:comp', [VerifyToken, cors(corsOptions)], Controllers.v_1_0.AVT.getBlok );
        app.get( '/v1/mapavtbycomp/:comp', [VerifyToken, cors(corsOptions)], Controllers.v_1_0.AVT.getCompany );
        app.get( '/v1/mapavtbyest/:comp', [VerifyToken, cors(corsOptions)], Controllers.v_1_0.AVT.getEstate );

        app.get( '/v1/jumlahtonasebyafd/:afd', [VerifyToken, cors(corsOptions)], Controllers.v_1_0.JT.getAFD );
        app.get( '/v1/jumlahtonasebyblok/:blok', [VerifyToken, cors(corsOptions)], Controllers.v_1_0.JT.getBlok );
        app.get( '/v1/jumlahtonasebycomp/:comp', [VerifyToken, cors(corsOptions)], Controllers.v_1_0.JT.getCompany );
        app.get( '/v1/jumlahtonasebyest/:est', [VerifyToken, cors(corsOptions)], Controllers.v_1_0.JT.getEstate );

        app.get( '/v1/tonasehkbyafd/:afd', [VerifyToken, cors(corsOptions)], Controllers.v_1_0.HK.getAFD );
        app.get( '/v1/tonasehkbyblok/:blok', [VerifyToken, cors(corsOptions)], Controllers.v_1_0.HK.getBlok );
        app.get( '/v1/tonasehkbycomp/:comp', [VerifyToken, cors(corsOptions)], Controllers.v_1_0.HK.getCompany );
        app.get( '/v1/tonasehkbyest/:est', [VerifyToken, cors(corsOptions)], Controllers.v_1_0.HK.getEstate );

        app.get( '/v1/progresstanambyafd/:afd', [VerifyToken, cors(corsOptions)], Controllers.v_1_0.PT.getAFD );
        app.get( '/v1/progresstanambyblok/:blok', [VerifyToken, cors(corsOptions)], Controllers.v_1_0.PT.getBlok );
        app.get( '/v1/progresstanambycomp/:comp', [VerifyToken, cors(corsOptions)], Controllers.v_1_0.PT.getCompany );
        app.get( '/v1/progresstanambyest/:est', [VerifyToken, cors(corsOptions)], Controllers.v_1_0.PT.getEstate );

        app.get( '/v1/nilaiinspeksibyafd/:afd', [VerifyToken, cors(corsOptions)], Controllers.v_1_0.I.getAFD );
        app.get( '/v1/nilaiinspeksibyblok/:blok', [VerifyToken, cors(corsOptions)], Controllers.v_1_0.I.getBlok );
        app.get( '/v1/nilaiinspeksibycomp/:comp', [VerifyToken, cors(corsOptions)], Controllers.v_1_0.I.getCompany );
        app.get( '/v1/nilaiinspeksibyest/:est', [VerifyToken, cors(corsOptions)], Controllers.v_1_0.I.getEstate );

        app.get( '/v1/jumlahinspeksibyafd/:afd', [VerifyToken, cors(corsOptions)], Controllers.v_1_0.I.getAFDJumlah );
        app.get( '/v1/jumlahinspeksibyblok/:blok', [VerifyToken, cors(corsOptions)], Controllers.v_1_0.I.getBlokJumlah );
        app.get( '/v1/jumlahinspeksibycomp/:comp', [VerifyToken, cors(corsOptions)], Controllers.v_1_0.I.getCompanyJumlah );
        app.get( '/v1/jumlahinspeksibyest/:est', [VerifyToken, cors(corsOptions)], Controllers.v_1_0.I.getEstateJumlah );

        app.get( '/v1/mapinspeksi/:blok', [VerifyToken, cors(corsOptions)], Controllers.v_1_0.I.getMap );
    }
