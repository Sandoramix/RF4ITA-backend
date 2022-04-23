const env = require("../config.json");

const sqlite = require(`better-sqlite3`);
let db_path = `./db.sqlite`;
var db = sqlite();
//TODO REMOVE VERBOSE MODE

try {
    db = sqlite(db_path, { fileMustExist: true });
} catch (error) {
    db = sqlite(db_path, { fileMustExist: false });
    const queries = [
        `DROP TABLE IF EXISTS users;`,
        `DROP TABLE IF EXISTS maps;`,
        `CREATE TABLE users (
    id       INTEGER       PRIMARY KEY AUTOINCREMENT,
    email    VARCHAR (100) UNIQUE,
    nickname VARCHAR (100) NOT NULL,
    password VARCHAR (100) NOT NULL,
    status   VARCHAR       NOT NULL
                           DEFAULT pending
                           CHECK (status IN ('pending', 'activated') ),
    token                  UNIQUE
);`,

        `CREATE TABLE maps (
    id               INTEGER       PRIMARY KEY AUTOINCREMENT,
    name             VARCHAR (100) NOT NULL,
    formatted_name   VARCHAR (100) NOT NULL,
    limits_x         VARCHAR (10)  NOT NULL,
    limits_y         VARCHAR (10)  NOT NULL,
    square_distance  INTEGER (5)   NOT NULL,
    has_ground_tiles CHAR (1)      DEFAULT F
                                   NOT NULL
                                   CHECK (has_ground_tiles IN ('F', 'T') ) 
);`,
    ];
    queries.forEach((x) => {
        db.prepare(x).run();
    });

    const maps = require(`../maps.json`);

    Object.entries(maps).forEach((map) => {
                let name = map[0];
                let data = map[1];
                var query = `INSERT INTO maps VALUES(null,'${name}','${data.prettifiedName}','${`${data.x.min}:${data.x.max}`}','${`${data.y.min}:${data.y.max}`}',${data.squareWidth},${
			data.hasGroundTiles ? `'T'` : `'F'`
		})`;

		db.prepare(query).run();
	});
}

module.exports = db;