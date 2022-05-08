const express = require(`express`);
const db = require(`../handlers/database`);
const { mapExists } = require("./maps");

var map_spots = new Map();
db.prepare(`SELECT * FROM map_spots`)
    .all()
    .forEach((x) => {
        if (!map_spots.has(x.map_name)) {
            map_spots.set(x.map_name, []);
        }
        map_spots.set(x.map_name, [
            ...map_spots.get(x.map_name),
            {
                x: x.x,
                y: x.y,
            },
        ]);
    });

module.exports = {
    base_route: `/spots`,
    endpoints: [],
    handler: () => {
        const route = express.Router({
            caseSensitive: false,
        });

        route.get(`/:map`, (req, res) => {
            const map_name = req.params.map;
            if (!mapExists(map_name))
                return res.status(404).json({
                    message: `Map doesn't exist`,
                });

            return res.status(200).json({
                results: map_spots.get(map_name) || [],
            });
        });
        return route;
    },
};