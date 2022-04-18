const db = require(`../database.js`);
const env = require(`../config.json`);

const express = require(`express`);

const fs = require(`fs`);
const path = require(`path`);
const maps = require(`../maps.json`);

module.exports = {
    base_route: `/maps`,
    endpoints: ["/:map/:id"],
    handler: () => {
        const route = express.Router({ caseSensitive: false });

        route.get(`/`, (req, res) => {
            res.status(200).json(maps);
        });
        route.get(`/:map/ground`, (req, res) => {
            var map_name = req.params.map.toLowerCase();

            if (!map_name || !maps[map_name]) {
                return notFound(res, "Map not found");
            }

            const file_path = `${env.maps_layouts_dir}/${map_name}.svg`;

            var file = path.resolve(file_path);

            if (!fs.existsSync(file)) {
                return res.send();
            }
            res.status(200).sendFile(file);
        });

        route.get(`/:map/:id`, (req, res) => {
            var map_name = req.params.map.toLowerCase();

            if (!maps[map_name]) {
                return notFound(res, "Map not found");
            }
            const id = req.params.id;
            const file_path = `${env.maps_dir}/${map_name}/${id}`;
            res.status = 200;

            var file = path.resolve(file_path);

            if (!fs.existsSync(file)) {
                return res.sendFile(path.resolve(`${env.maps_dir}/tile_not_found.jpg`));
            }

            res.sendFile(file);
        });

        function notFound(res, message) {
            res.status = 404;
            res.json({
                response: message,
            });
        }

        return route;
    },
};

// "maps_names": [
//     "thecottagepond",
//     "mosquitolake",
//     "windingrivulet",
//     "oldburglake",
//     "belayalake",
//     "kuorilake",
//     "bearklake",
//     "volkhovriver",
//     "severskydonetsriver",
//     "surariver",
//     "ladogariver",
//     "theamberlake",
//     "ladogaarchipelago",
//     "akhtubariver",
//     "lowertunguskariver",
//     "yamariver"
// ],