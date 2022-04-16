const db = require(`../database.js`);
const env = require(`../config.json`);

const express = require(`express`);

const fs = require(`fs`);
const path = require(`path`);

module.exports = {
    base_route: `/maps`,
    endpoints: ["/:map/:id"],
    handler: () => {
        const route = express.Router({ caseSensitive: false });

        route.get(`/`, (req, res) => {
            res.json({
                response: env.maps_names,
            });
        });
        route.get(`/:map/ground`, (req, res) => {
            console.log(req.params);
            const map_name = req.params.map.toLowerCase();
            console.log();
            if (!env.maps_names.includes(map_name)) {
                return notFound(res, "Map not found");
            }

            const file_path = `${env.maps_layouts_dir}/${map_name}.svg`;
            console.log(file_path);
            var file = path.resolve(file_path);

            if (!fs.existsSync(file)) {
                return res.send();
            }
            res.status(200).sendFile(file);
        });

        route.get(`/:map/:id`, (req, res) => {
            const map_name = req.params.map;
            if (!env.maps_names.includes(map_name.toLowerCase())) {
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