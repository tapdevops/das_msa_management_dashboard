var functions = require(_directory_base + '/app/libraries/function.js');
require('dotenv').config()

exports.getAFD = async (req, res) => {
    let comp = req.query.comp;
    var query = `SELECT * FROM ${process.env.ORACLE_SCHEME}.DASMAP_MAPAFD_MV WHERE COMPANY_CODE LIKE '%${(comp == undefined ? '' : comp)}%'`;
    functions.fetch(query, res, req.query.color);
}

exports.getBlok = async (req, res) => {
    let comp = req.query.comp;
    var query = `SELECT * FROM ${process.env.ORACLE_SCHEME}.DASMAP_MAPBLOCK_MV WHERE COMPANY_CODE LIKE '%${(comp == undefined ? '' : comp)}%'`;
    functions.fetch(query, res, req.query.color);
}

exports.getCompany = async (req, res) => {
    let comp = req.query.comp;
    var query = `SELECT * FROM ${process.env.ORACLE_SCHEME}.DASMAP_MAPCOMP_MV WHERE COMPANY_CODE LIKE '%${(comp == undefined ? '' : comp)}%'`;
    functions.fetch(query, res, req.query.color);
}

exports.getEstate = async (req, res) => {
    let comp = req.query.comp;
    var query = `SELECT * FROM ${process.env.ORACLE_SCHEME}.DASMAP_MAPEST_MV WHERE COMPANY_CODE LIKE '%${(comp == undefined ? '' : comp)}%'`;
    functions.fetch(query, res, req.query.color);
}