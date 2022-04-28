const sqlite = require(`better-sqlite3`);
let path = require(`path`);
let db_path = path.resolve(__dirname, `../`, `db.sqlite`);
var db = sqlite();
//TODO REMOVE VERBOSE MODE

try {
    db = sqlite(db_path, { fileMustExist: true });
} catch (error) {
    db = sqlite(db_path, { fileMustExist: false });
    const queries = [
        `DROP TABLE IF EXISTS maps;`,
        `CREATE TABLE maps (
    id                INTEGER       PRIMARY KEY AUTOINCREMENT,
    name              VARCHAR (100) NOT NULL,
    formatted_name    VARCHAR (100) NOT NULL,
    formatted_name_it VARCHAR (100),
    limits_x          VARCHAR (10)  NOT NULL,
    limits_y          VARCHAR (10)  NOT NULL,
    square_distance   INTEGER (5)   NOT NULL,
    has_ground_tiles  CHAR (1)      DEFAULT F
                                    NOT NULL
                                    CHECK (has_ground_tiles IN ('F', 'T') ) 
);`,
        `DROP TABLE IF EXISTS fishes;`,
        `CREATE TABLE fishes (
    id           INTEGER      PRIMARY KEY AUTOINCREMENT,
    name         VARCHAR (50) NOT NULL,
    name_it      VARCHAR,
    trophy       INTEGER,
    super_trophy INTEGER,
    icon         VARCHAR
);`,
        `DROP TABLE IF EXISTS map_fishes;`,
        `CREATE TABLE map_fishes (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    map  INTEGER REFERENCES maps (id) ON DELETE CASCADE
                                      MATCH SIMPLE
                 NOT NULL,
    fish INTEGER REFERENCES fishes (id) ON DELETE CASCADE
                                        MATCH SIMPLE
                 NOT NULL
);`,
        `DROP TABLE IF EXISTS map_trophies;`,
        `CREATE TABLE map_trophies (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    map  VARCHAR REFERENCES maps (id) ON DELETE CASCADE
                                      MATCH SIMPLE,
    fish VARCHAR REFERENCES fishes (id) ON DELETE CASCADE
                                        MATCH SIMPLE
);
`,
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