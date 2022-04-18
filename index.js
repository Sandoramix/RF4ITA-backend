const env = require(`./config.json`);

const path = require(`path`);
const fs = require(`fs`);

const express = require(`express`);
const http = require(`http`);
const cors = require(`cors`);

const app = express(cors());

const http_server = http.createServer(app).listen(env.server.port, env.server.host, () => {
    console.log(`listening on http://localhost:${env.server.port}`);
});

app.use(`/leaflet`, express.static(`./node_modules/leaflet/dist/`));
app.use(`/`, express.static(path.join(__dirname, `public`)));

var endpoints = {};
getHandlers();

function getHandlers() {
    var module_files = fs.readdirSync(path.resolve(__dirname, env.routes_dir), {
        withFileTypes: true,
    });
    module_files.forEach((file) => {
        if (!file.name.endsWith(`.js`)) {
            return;
        }
        let handler_file = require(path.join(__dirname, env.routes_dir, file.name).replace(`.js`, ``));
        let route = handler_file.base_route;
        endpoints[route] = handler_file.endpoints;
        let handler = handler_file.handler();

        app.use(route, handler);
    });
}