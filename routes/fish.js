const express = require(`express`);
const db = require(`../handlers/database`);
const { errorCatch } = require("../handlers/utils");
const { mapExists } = require("./maps");
const lastchange = "2022-06-21T20:30:17.134Z"
var fishes = [];
db.prepare(`SELECT * FROM fishes`)
    .all()
    .forEach((fish) => {
        fishes.push({
            id: fish.id,
            default_name: fish.name,
            fish_name: fish.name,
            fish_name_it: fish.name_it,
            fish_trophy: fish.trophy,
            fish_super_trophy: fish.super_trophy,
            icon: fish.icon,
        });
    });
var map_fishes = new Map();
db.prepare(`SELECT * FROM map_fishable`)
    .all()
    .forEach((x) => {
        if (!map_fishes.has(x.map_name)) {
            map_fishes.set(x.map_name, []);
        }
        map_fishes.set(x.map_name, [
            ...map_fishes.get(x.map_name),
            {
                default_name: x.fish_name,
                fish_name: x.fish_name,
                fish_name_it: x.fish_name_it,
                fish_trophy: x.fish_trophy,
                fish_super_trophy: x.fish_super_trophy,
                fish_icon: x.fish_icon,
            },
        ]);
    });

var map_trophies = new Map();
db.prepare(`SELECT * FROM all_map_trophies`)
    .all()
    .forEach((x) => {
        if (!map_trophies.has(x.map_name)) {
            map_trophies.set(x.map_name, []);
        }
        map_trophies.set(x.map_name, [
            ...map_trophies.get(x.map_name),
            {
                default_name: x.fish_name,
                fish_name: x.fish_name,
                fish_name_it: x.fish_name_it,
                fish_trophy: x.fish_trophy,
                fish_super_trophy: x.fish_super_trophy,
                fish_icon: x.fish_icon,
            },
        ]);
    });

module.exports = {
    base_route: `/fishes`,
    endpoints: [],
    handler: () => {
        const route = express.Router({ caseSensitive: false });

        route.get(`/`, (req, res) => {
            res.status(200).json(fishes);
        });
        route.get(`/lastchange`, (req, res) => {
            res.status(200).json({
                date: lastchange
            });
        });
        //
        route.get(`/:map`, (req, res) => {
            var map_name = req.params.map.toLowerCase();

            if (!map_name || !mapExists(map_name)) {
                return errorCatch(res, 404, `Map not found`);
            }

            res.status(200).json(map_fishes.get(map_name) || []);
        });
        route.get(`/:map/trophies`, (req, res) => {
            var map_name = req.params.map.toLowerCase();

            if (!map_name || !mapExists(map_name)) {
                return errorCatch(res, 404, `Map not found`);
            }

            res.status(200).json(map_trophies.get(map_name) || []);
        });

        return route;
    },
};