require(`dotenv`).config();

const env = {
    server: {
        port: 80,
        host: "0.0.0.0",
    },
};

const path = require(`path`);
const fs = require(`fs`);

const express = require(`express`);

const cors = require(`cors`);
const bodyParser = require(`body-parser`);

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.listen(env.server.port, env.server.host, () => {
    console.log(`listening on http://localhost:${env.server.port}`);
});

app.use(`/leaflet`, express.static(`./node_modules/leaflet/dist/`));
app.use(`/`, express.static(path.join(__dirname, `public`)));

var endpoints = {};
getHandlers();

const mobileBrowser = require("detect-mobile-browser");
app.use(mobileBrowser());
app.use(`/api/ismobile`, cors(), (req, res) => {
    let result = req.SmartPhone.isAny();
    res.status(200).json({ result });
});

function getHandlers() {
    var module_files = fs.readdirSync(path.resolve(__dirname, `routes`), {
        withFileTypes: true,
    });
    module_files.forEach((file) => {
        if (!file.name.endsWith(`.js`)) {
            return;
        }
        let handler_file = require(path.join(__dirname, `routes`, file.name).replace(`.js`, ``));
        let route = handler_file.base_route;
        endpoints[route] = handler_file.endpoints;
        let handler = handler_file.handler();

        app.use(`/api${route}`, cors(), handler);
    });
}