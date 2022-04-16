const env = require("./config.json");

const mysql = require(`mysql`);
const db = mysql.createPool({
	connectionLimit: 20,
	host: env.database.host,
	user: env.database.user,
	password: env.database.password,
	database: env.database.schema,
	port:env.database.port
});
db.getConnection((err) => {
	console.log(err || `Connessione al database riuscita!`);
});
module.exports = db;