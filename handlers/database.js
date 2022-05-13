const sqlite = require(`better-sqlite3`);
let path = require(`path`);
let db_path = path.resolve(__dirname, `../`, `db.sqlite`);
var db = sqlite();
//TODO REMOVE VERBOSE MODE
const maps = require(`../maps.json`);
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
        `DROP VIEW IF EXISTS map_fishable;`,
        `CREATE VIEW map_fishable AS
    SELECT m.name AS map_name,
           m.formatted_name AS map_formatted_name,
           m.formatted_name_it AS map_formatted_name_it,
           f.name AS fish_name,
           f.name_it AS fish_name_it,
           f.trophy AS fish_trophy,
           f.super_trophy AS fish_super_trophy,
           f.icon AS fish_icon
      FROM map_fishes mf
           INNER JOIN
           maps m ON m.id = mf.map
           INNER JOIN
           fishes f ON f.id = mf.fish;`,
        `DROP VIEW IF EXISTS all_map_trophies;`,
        `CREATE VIEW all_map_trophies AS
    SELECT m.name AS map_name,
           m.formatted_name AS map_formatted_name,
           m.formatted_name_it AS map_formatted_name_it,
           f.name AS fish_name,
           f.name_it AS fish_name_it,
           f.trophy AS fish_trophy,
           f.super_trophy AS fish_super_trophy,
           f.icon AS fish_icon
      FROM map_trophies mt
           INNER JOIN
           maps m ON m.id = mt.map
           INNER JOIN
           fishes f ON f.id = mt.fish;`,
    ];
    queries.forEach((x) => {
        db.prepare(x).run();
    });

    Object.entries(maps).forEach((map) => {
                let name = map[0];
                let data = map[1];
                var query = `INSERT INTO maps VALUES(null,'${name}','${data.prettifiedName}','${`${data.x.min}:${data.x.max}`}','${`${data.y.min}:${data.y.max}`}',${data.squareWidth},${
			data.hasGroundTiles ? `'T'` : `'F'`
		},${data.unlockedAt});`;

		db.prepare(query).run();
	});
}

// Object.entries(maps).forEach((map) => {
// 	let name = map[0];
// 	let data = map[1];
// 	var query = `update maps set unlocked_at=${data.unlockedAt} where name='${name}'`;

// 	db.prepare(query).run();
// });

module.exports = db;