/*
|--------------------------------------------------------------------------
| Variable
|--------------------------------------------------------------------------
*/
	const NJWT = require( 'njwt' );

/*
|--------------------------------------------------------------------------
| Security
|--------------------------------------------------------------------------
|
| The implementation of a security policy as well as a security objective. 
| It enforces the security policy and provides required capabilities. 
| Security functions are defined to withstand certain security threats, 
| vulnerabilities, and risks. A security function usually consists of one 
| or more principals, resources, security properties, and security 
| operations.
|
*/
	//untuk membaca file .env
	require('dotenv').config()
	
	class Security {

		/**
		 * JSON Web Token (JWT) is an open standard (RFC 7519) that defines 
		 * a compact and self-contained way for securely transmitting 
		 * information between parties as a JSON object. This information 
		 * can be verified and trusted because it is digitally signed. 
		 * JWTs can be signed using a secret (with the HMAC algorithm) 
		 * or a public/private key pair using RSA or ECDSA.
		 */
		generate_token( claims ) {
			var setup = NJWT.create( claims, process.env.SECRET_KEY, process.env.TOKEN_ALGORITHM );
				setup.setExpiration( new Date().getTime() + ( config.app.token_expiration * 24 * 60 * 60 * 1000 ) );
			var token = setup.compact();
			return token;
		}
	}


/*
|--------------------------------------------------------------------------
| Module Exports
|--------------------------------------------------------------------------
*/
	module.exports = new Security();