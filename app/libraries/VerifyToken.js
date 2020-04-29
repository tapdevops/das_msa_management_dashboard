/*
|--------------------------------------------------------------------------
| Variable
|--------------------------------------------------------------------------
*/
	// Node Modules
	const NJWT = require( 'njwt' );
	const JWTDecode = require( 'jwt-decode' );

/*
|--------------------------------------------------------------------------
| Verify Token Middleware
|--------------------------------------------------------------------------
|
| When they present the JWT, you want to check the token to ensure that 
| it's valid. This library does the following checks when you call the verify 
| method: It was created by you (by verifying the signature, using the secret 
| signing key)
|
*/
	//untuk membaca file .env
	require('dotenv').config()

	module.exports = function( req, res, next ) {
		const bearer_header = req.headers['authorization'];
		if ( typeof bearer_header !== 'undefined' ) {
			const bearer = bearer_header.split( ' ' );
			const bearer_token = bearer[1];
			req.token = bearer_token;
			NJWT.verify( bearer_token, process.env.SECRET_KEY, process.env.TOKEN_ALGORITHM, ( err, authData ) => {
				if ( err ) {
					res.status(401).send({
						status: false,
						message: "Invalid Token",
						data: []
					} );
				}
				else {
					req.auth = JWTDecode( req.token );
					req.config = config;
					next();
				}
			} );
		}
		else {
			// Forbidden
			res.status(401).send({
				status: false,
				message: 'Provide the token',
				data: []
			});
		}
	}