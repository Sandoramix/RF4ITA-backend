const db = require(`../handlers/database.js`);

const express = require(`express`);

const fs = require(`fs`);
const path = require(`path`);

const { errorCatch } = require("../handlers/utils");

var maps = [];
db.prepare(`SELECT * FROM maps`)
    .all()
    .forEach((map) => {
        let limitsX = map.limits_x.split(":");
        let limitsY = map.limits_y.split(":");

        maps.push({
            id: map.id,
            name: map.name,
            default_name: map.formatted_name,
            formatted_name: map.formatted_name,

            formatted_name_it: map.formatted_name_it,
            limits: {
                x: {
                    min: parseInt(limitsX[0]),
                    max: parseInt(limitsX[1]),
                },
                y: {
                    min: parseInt(limitsY[0]),
                    max: parseInt(limitsY[1]),
                },
            },
            square_distance: map.square_distance,
            has_ground_tiles: map.has_ground_tiles === "T",
            unlocked_at: map.unlocked_at,
        });
    });

const mapExists = (name) => maps.find((m) => m.name === name);

module.exports = {
    base_route: `/maps`,
    endpoints: ["/:map/:id"],
    handler: () => {
        const route = express.Router({ caseSensitive: false });

        route.get(`/`, (req, res) => {
            res.status(200).json({
                results: maps,
            });
        });

        route.get(`/:map/points`, (req, res) => {
            res.status(200).json({
                message: `ciao`,
            });
        });

        route.get(`/:map/ground`, (req, res) => {
            var map_name = req.params.map.toLowerCase();

            if (!map_name || !mapExists(map_name)) {
                return errorCatch(res, 404, `Map not found`);
            }

            const file_path = `./static/layouts/${map_name}.svg`;

            var file = path.resolve(file_path);

            if (!fs.existsSync(file)) {
                return res.status(404).send(null);
            }
            res.status(200).sendFile(file);
        });

        route.get(`/:map/:id`, (req, res) => {
            var map_name = req.params.map.toLowerCase();

            if (!mapExists(map_name)) {
                return errorCatch(res, 404, `Map not found`);
            }
            const id = req.params.id;
            const file_path = `./static/map_tiles/${map_name}/${id}`;
            res.status = 200;

            var file = path.resolve(file_path);

            if (!fs.existsSync(file)) {
                return res.sendFile(path.resolve(`./static/map_tiles/tile_not_found.jpg`));
            }

            res.sendFile(file);
        });

        return route;
    },
    mapExists,
};