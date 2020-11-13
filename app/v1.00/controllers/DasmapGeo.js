// Modules
const GeoJSONPrecision = require('geojson-precision');
const axios = require('axios');
var request = require("request");
var geo_result = [];
var url_dasmap = config.app.url[config.app.env].dasmap;
var simplify = require('simplify-geometry');
var moment = require('moment');
var functions = require(_directory_base + '/app/libraries/function.js');

exports.sendWA = async (req, res) => {
	var datas = await functions.fetchReturn(`
		select '*Panen '||to_char(trunc(sysdate-1), 'dd-Mon-rrrr') ||'*'||chr(10)||chr(10)||teks TEKS
		from (
			select listagg(RPAD(map.comp_desc, 10, ' ')||' '||trim(TO_CHAR(sum(kg_taksasi), '99G999G999G9999', 'NLS_NUMERIC_CHARACTERS=",."')), chr(10) ) 
					within group (order by pr.comp_code) as teks
			from tap_dw.tr_hv_productivity_daily pr
			left join (select comp_code, case when length(comp_desc) = 3 then comp_desc||' ' else comp_desc end as comp_desc from rizki.TM_MAPPING_SUB_REGION group by comp_code, comp_desc) map
				on map.comp_code = pr.comp_code
			where tgl_panen = trunc(sysdate-1)
			group by map.comp_desc, pr.comp_code
		)
	`, res);

	// return  res.send({
	// 	status: true,
	// 	message: "Berhasil",
	// 	data: datas.rows[0].TEKS
	// });

	console.log(datas);
	['6281314999812', '6287880683744', '628818288569', '6287729006690'].forEach(nomer => {
		var options = {
			method: 'GET',
			url: 'https://panel.rapiwha.com/send_message.php',
			qs: {apikey: 'ZLIUITS9AEGOBMTNFJMP', number: nomer, text: datas.rows[0].TEKS}
		};

		request(options, function (error, response, body) {
			if (error) throw new Error(error);
		  
			console.log(body);
		});
	});

	return  res.send({
		status: true,
		message: "Berhasil",
		data: 'sukses'
	});
}

// Parsing geojson standar ke kebutuhan mobile
function parseTemp(coordinate, precision = 0.0001){
	var coords = [];
	// coordinates.forEach(function(coordinate, index) {
		// coordinate = coordinate[0];
		// console.log(coordinate.length, 'coor');
		// console.log(.length, 'simplified');
		coordinate = simplify(coordinate, precision);
		// console.log(coordinate.length, 'coor2');

		for (var i = 0; i < coordinate.length; i++) {
			for (var j = i + 1; j < coordinate.length;) {
				if (coordinate[i][0] == coordinate[j][0] && coordinate[i][1] == coordinate[j][1])
					// Found the same. Remove it.
					coordinate.splice(j, 1);
				else
					// No match. Go ahead.
					j++;
			}
		}
		// temporary_geometry.coords = [];
		coordinate.slice(0).forEach(function (locs, indexx) {
			coords.push({
				longitude: locs[0],
				latitude: locs[1]
			});
		});

	// });

	return coords;
}

function parseGeo(data, precision){
	var data_geometry;
	// if(data.features.length < 50){
	// 	data_geometry = GeoJSONPrecision.parse(data, 4);
	// }else {
	// 	data_geometry = GeoJSONPrecision.parse(data, 3);
	// }

	// data_geometry = GeoJSONPrecision.parse(data, 4);
	data_geometry = data;
	var results = [];
	if (data_geometry.features) {
		data_geometry.features.forEach(function (data, y) {
			var coordinates = data.geometry.coordinates;
			// var coords = coordinates;
			
			var temporary_geometry = {};
			// var header_polygon;
			Object.keys(data.properties).forEach(function(key) {
				var val = data.properties[key];
				temporary_geometry[key] = (val == null) ? '' : val;
			});
			temporary_geometry['color'] = 'rgb(255, 255, 255)';

			var coords = [];
			coordinates.forEach(function(coordinate, index) {
				results.push(Object.assign( JSON.parse(JSON.stringify(temporary_geometry)) , {
					coords : parseTemp(coordinate[0], precision)
				}));
			});

		});
		return results;
	}
	else {
		return false;
	}
}

// Get geojson untuk semua layer di peta
function getGeo(url, data, token, res, precision = 0.0000001, format = '') { 
	var now = data.length - 1;
	if(now == -1){
		var result = geo_result;
		geo_result = [];
		return res.json({
			status: true,
			message: "Success!",
			data: result
		});
	}

	if(data[now].type == 'tile'){
		// console.log(data[now].name);
		axios.post(url.replace('{dataId}', data[now].dataId), token, {headers: { "Content-Type": "application/json" }})
		.then(function (response) {
			var new_token = {
				_csrfKey: response.data._csrfKey,
				_csrfToken: response.data._csrfToken
			}

			if(format == 'openlayer'){
				response.data['layer'] = data[now].name;
				data_geometry = response.data;
				// if (data_geometry.features) {
				// 	data_geometry.features.forEach(function (data, y) {
				// 		var coordinates = data.geometry.coordinates;
			
				// 		coordinates.forEach(function(coordinate, index) {
				// 			coordinates[index][0] = simplify(coordinate[0], precision);
				// 		});
			
				// 	});
				// }

				geo_result.unshift(data_geometry);
			}else{
				geo_result.push({
					name 	: data[now].name,
					color 	: data[now].rules[0].lineSymbolizer.stroke,
					geo		: parseGeo(response.data, precision)
				});
			}

			data.pop();
			// data = [];
			getGeo(url, data, new_token, res, precision, format);
		});
	}else{
		data.pop();
		getGeo(url, data, token, res, precision, format);
	}
}

// get config peta dasmap berdasarkan id peta berupa geojson mobile
exports.parse_geojson = (req, res) => {
	var results = [];
	var key = process.env.DASMAP_KEY;
	var data = {
		key : key
	}

	var options = { 
		method: 'POST',
		url: url_dasmap + '/user/index/token',
		headers: 
		{
			'Cache-Control': 'no-cache',
			'Content-Type': 'text/html; charset=UTF-8'
		},
		formData: data
	};

	try {
		// get token from key
		request(options, function (error, response, body) {
			console.log(error);
			if (error){
				return  res.status(501).send({
					status: false,
					message: "Gagal",
					data: error
				});
			}
			data = JSON.parse(body);
			data.account = process.env.DASMAP_USER;
			data.password = process.env.DASMAP_PASSWORD;
			
			// get authorization from dasmap
			axios.post(url_dasmap + '/api/user/login', data, {headers: { "Content-Type": "application/json" }})
			.then((response) => {
				data = {
					_csrfKey: response.data._csrfKey,
					_csrfToken: response.data._csrfToken
				}
				console.log('get user sukses');

				// get config in map based on map id
				// console.log(url_dasmap + `/api/site/maps?term=(id = ${req.query.peta})`);
				axios.post(url_dasmap + `/api/site/maps?term=(id = ${req.query.peta})`, data, {headers: { "Content-Type": "application/json" }})
				.then((response) => {
					// console.log(response.data[0]);
					if(response.data.access == 'forbidden'){
						console.log('forbidden')
						return res.status(501).send({
							status: false,
							message: "Gagal",
							data: response.data
						});
					}else if (response.data._csrfKey) {
						console.log('get layer sukses');

						if(req.query.type == 'config'){
							return res.json({
								status: true,
								message: "Success!",
								data: JSON.parse(response.data[0].config)
							});
						} else if(req.query.type == 'lastdate'){
							return res.json({
								status: true,
								message: "Success!",
								data: response.data[0].lastdate
							});
						}
						
						if(moment(req.query.last_sync, 'YYYY-MM-DD',true).isValid()){
							if(moment(response.data[0].lastdate).format("YYYY-MM-DD") >= moment(req.query.last_sync, 'YYYY-MM-DD')){
								return res.json({
									status: true,
									message: "No Changes",
									data: []
								}); 
							}
						}

						var layers = JSON.parse(response.data[0].config).layers;
						data = {
							_csrfKey: response.data._csrfKey,
							_csrfToken: response.data._csrfToken
						}

						if(req.query.layer != undefined){
							layers = layers.filter(function (attr) { 
								// return attr.name == req.query.layer;
								return req.query.layer.split(',').includes(attr.name)
							});
						}

						getGeo(url_dasmap + '/api/iyo/myrecords/{dataId}/1/1?format=geojson&limit=10000', layers, data, res, req.query.prec, req.query.for);
					}else{
						return res.json({
							status: true,
							message: "Success!",
							data: response.data
						});
					}
				}).catch(err => {
					console.log(err, '1')
					return res.status(501).send({
						status: false,
						message: "Gagal",
						data: JSON.stringify(err)
					});
				});
			}).catch(err => {
				console.log(err, '2')
				return res.status(501).send({
					status: false,
					message: "Gagal",
					data: JSON.stringify(err)
				});
			});
		});
	}catch(err){
		return res.status(501).send( {
            status: false,
            message: err,
            data: []
        } );
	}
}