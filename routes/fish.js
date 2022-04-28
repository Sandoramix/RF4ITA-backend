const express = require(`express`);
const db = require(`../handlers/database`);
const { errorCatch } = require("../handlers/utils");
const { maps_has } = require("./maps");

var fishes = [];
db.prepare(`SELECT * FROM fishes`)
    .all()
    .forEach((fish) => {
        fishes.push({
            id: fish.id,
            name: fish.name,
            name_it: fish.name_it,
            trophy: fish.trophy,
            super_trophy: fish.super_trophy,
            icon: fish.icon,
        });
    });
var map_fishes = [];
db.prepare(`SELECT * FROM map_fishable`)
    .all()
    .forEach((x) => {
        map_fishes.push({
            map_name: x.map_name,
            fish_name: x.fish_name,
            fish_name_it: x.fish_name_it,
            fish_trophy: x.fish_trophy,
            fish_super_trophy: x.fish_super_trophy,
            fish_icon: x.fish_icon,
        });
    });

var map_trophies = [];
db.prepare(`SELECT * FROM all_map_trophies`)
    .all()
    .forEach((x) => {
        map_trophies.push({
            map_name: x.map_name,
            fish_name: x.fish_name,
            fish_name_it: x.fish_name_it,
            fish_trophy: x.fish_trophy,
            fish_super_trophy: x.fish_super_trophy,
            fish_icon: x.fish_icon,
        });
    });

module.exports = {
    base_route: `/fishes`,
    endpoints: [],
    handler: () => {
        const route = express.Router({ caseSensitive: false });

        route.get(`/`, (req, res) => {
            res.status(200).json({
                results: fishes,
            });
        });
        route.get(`/:map`, (req, res) => {
            var map_name = req.params.map.toLowerCase();
            console.log(map_name);
            if (!map_name || !maps_has(map_name)) {
                return errorCatch(res, 404, `Map not found`);
            }
            let filtered = map_fishes.filter((x) => x.map_name === map_name);

            res.status(200).json({
                results: filtered,
            });
        });
        route.get(`/:map/trophies`, (req, res) => {
            var map_name = req.params.map.toLowerCase();

            if (!map_name || !maps_has(map_name)) {
                return errorCatch(res, 404, `Map not found`);
            }
            let filtered = map_trophies.filter((x) => x.map_name === map_name);

            res.status(200).json({
                results: filtered,
            });
        });

        return route;
    },
};