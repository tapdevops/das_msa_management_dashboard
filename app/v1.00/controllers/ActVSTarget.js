var functions = require(_directory_base + '/app/libraries/function.js');
require('dotenv').config()

exports.getAFD = async (req, res) => {
    let comp = req.params.comp;
    var query = `SELECT * FROM ${process.env.ORACLE_SCHEME}.DAS_AFD_MAP_PRODUKSI_PANEN_MV WHERE COMPANY_CODE = '${(comp == undefined ? '' : comp)}'`;
    functions.fetch(query, res, req.query.color);
}

exports.getBlok = async (req, res) => {
    let comp = req.params.comp;
    var query = `SELECT * FROM ${process.env.ORACLE_SCHEME}.DAS_BLOK_MAP_PRODUKSI_PANEN_MV WHERE COMPANY_CODE = '${(comp == undefined ? '' : comp)}'`;
    functions.fetch(query, res, req.query.color);
}

exports.getCompany = async (req, res) => {
    let comp = req.params.comp;
    var query = `SELECT * FROM ${process.env.ORACLE_SCHEME}.DAS_COM_MAP_PRODUKSI_PANEN_MV WHERE COMPANY_CODE = '${(comp == undefined ? '' : comp)}'`;
    functions.fetch(query, res, req.query.color);
}

exports.getEstate = async (req, res) => {
    let comp = req.params.comp;
    var query = `SELECT * FROM ${process.env.ORACLE_SCHEME}.DAS_EST_MAP_PRODUKSI_PANEN_MV WHERE COMPANY_CODE = '${(comp == undefined ? '' : comp)}'`;
    functions.fetch(query, res, req.query.color);
}