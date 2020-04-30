var functions = require(_directory_base + '/app/libraries/function.js');
require('dotenv').config()

exports.getAFD = async (req, res) => {
    var query = `SELECT * FROM ${process.env.ORACLE_SCHEME}.DASMAP_MAPAFD_MV`;
    functions.fetch(query, res);
}

exports.getBlok = async (req, res) => {
    var query = `SELECT * FROM ${process.env.ORACLE_SCHEME}.DASMAP_MAPBLOCK_MV`;
    functions.fetch(query, res);
}

exports.getCompany = async (req, res) => {
    var query = `SELECT * FROM ${process.env.ORACLE_SCHEME}.DASMAP_MAPCOMP_MV`;
    functions.fetch(query, res);
}

exports.getEstate = async (req, res) => {
    var query = `SELECT * FROM ${process.env.ORACLE_SCHEME}.DASMAP_MAPEST_MV`;
    functions.fetch(query, res);
}