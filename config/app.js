/*
|--------------------------------------------------------------------------
| Module Exports
|--------------------------------------------------------------------------
*/
	require('dotenv').config()
	module.exports = {

		/*
		|--------------------------------------------------------------------------
		| App Config
		|--------------------------------------------------------------------------
		*/
			name: 'Microservice Management Dashboard',
			env: process.env.APP, // prod, qa, dev,
			port: {
				dev: process.env.PORT || 3017,
				qa: process.env.PORT || 5017,
				prod: process.env.PORT || 3017,
			},

		/*
		|--------------------------------------------------------------------------
		| Token
		|--------------------------------------------------------------------------
		*/
			secret_key: 'T4pagri123#',
			token_expiration: 9000, // Days
			token_algorithm: 'HS256',
		
		/*
		|--------------------------------------------------------------------------
		| Kafka Config
		|--------------------------------------------------------------------------
		*/
			kafka: {
				dev: {
					server_host: '149.129.221.137:9092'
				},
				qa: {
					server_host: '149.129.221.137:9092'
				},
				prod: {
					// server_host: '149.129.221.137:9092'
					server_host: '149.129.252.13:9092'
				}
			},

		/*
		|--------------------------------------------------------------------------
		| URL
		|--------------------------------------------------------------------------
		*/
			url: {
				dev: {
					ldap: 'http://tap-ldapdev.tap-agri.com/login',
					ldap_2: 'http://tap-ldapdev.tap-agri.com',
					dasmap: 'http://portal-gis.tap-agri.com',
					microservice_auth: 'http://apis.tap-agri.com/mobileinspectiondev/ins-msa-dev-auth',
					microservice_ebcc_validation: 'http://apis.tap-agri.com/mobileinspectiondev/ins-msa-dev-ebccval',
					microservice_finding: 'http://apis.tap-agri.com/mobileinspectiondev/ins-msa-dev-finding',
					microservice_hectare_statement: 'http://apis.tap-agri.com/mobileinspectiondev/ins-msa-dev-hectarestatement',
					microservice_inspection: 'http://apis.tap-agri.com/mobileinspectiondev/ins-msa-dev-inspection',
					microservice_point: 'http://apis.tap-agri.com/mobileinspectiondev/ins-msa-dev-point',
					microservice_images: 'http://image.tap-agri.com:4012',
				},
				qa: {
					ldap: 'http://tap-ldapdev.tap-agri.com/login',
					ldap_2: 'http://tap-ldapdev.tap-agri.com',
					dasmap: 'http://portal-gis.tap-agri.com',
					microservice_auth: 'http://apis.tap-agri.com/mobileinspectionqa/ins-msa-qa-auth',
					microservice_ebcc_validation: 'http://apis.tap-agri.com/mobileinspectionqa/ins-msa-qa-ebccval',
					microservice_finding: 'http://apis.tap-agri.com/mobileinspectionqa/ins-msa-qa-finding',
					microservice_hectare_statement: 'http://apis.tap-agri.com/mobileinspectionqa/ins-msa-qa-hectarestatement',
					microservice_inspection: 'http://apis.tap-agri.com/mobileinspectionqa/ins-msa-qa-inspection',
					microservice_point: 'http://apis.tap-agri.com/mobileinspectionqa/ins-msa-qa-point',
					microservice_images: 'http://image.tap-agri.com:5012',
				},
				prod: {
					ldap: 'http://tap-ldap.tap-agri.com/login',
					ldap_2: 'http://tap-ldap.tap-agri.com',
					dasmap: 'http://portal-gis.tap-agri.com',
					microservice_auth: 'http://apis.tap-agri.com/mobileinspection/ins-msa-auth',
					microservice_ebcc_validation: 'http://apis.tap-agri.com/mobileinspection/ins-msa-ebccval',
					microservice_finding: 'http://apis.tap-agri.com/mobileinspection/ins-msa-finding',
					microservice_hectare_statement: 'http://apis.tap-agri.com/mobileinspection/ins-msa-hectarestatement',
					microservice_inspection: 'http://apis.tap-agri.com/mobileinspection/ins-msa-inspection',
					microservice_point: 'http://apis.tap-agri.com/mobileinspection/ins-msa-point',
					microservice_images: 'http://image.tap-agri.com:3012'
				}
			},
		
		/*
		|--------------------------------------------------------------------------
		| Error Message
		|--------------------------------------------------------------------------
		*/
			error_message: {
				invalid_token: 'Token expired! ',
				invalid_request: 'Invalid Request! ',
				create_200: 'Success! ',
				create_403: 'Forbidden ',
				create_404: 'Error! Data gagal diproses. ',
				create_500: 'Error! Terjadi kesalahan dalam pembuatan data ',
				find_200: 'Success! ',
				find_403: 'Forbidden ',
				find_404: 'Error! Tidak ada data yang ditemukan ',
				find_500: 'Error! Terjadi kesalahan dalam penampilan data ',
				put_200: 'Success! ',
				put_403: 'Forbidden ',
				put_404: 'Error! Data gagal diupdate ',
				put_500: 'Error! Terjadi kesalahan dalam perubahan data ',
				delete_200: 'Success! ',
				delete_403: 'Forbidden ',
				delete_404: 'Error! Data gagal dihapus ',
				delete_500: 'Error! Terjadi kesalahan dalam penghapusan data ',
			}
	}
