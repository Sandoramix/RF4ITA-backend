const jwt = require(`jsonwebtoken`);
const bcrypt = require(`bcrypt`);

const env = require(`../config.json`);
const db = require("./database");

const auth = (req, res, next) => {
    try {
        const auth = req.headers.authorization;
        if (!auth) throw `No authorization token provided`;
        const token = auth.split(` `)[1];

        const decodedToken = jwt.verify(token, process.env.jwt_secret);

        let query = `SELECT * FROM users WHERE email='${decodedToken.user_email}' and id=${decodedToken.user_id}`;
        let user = db.prepare(query).get();
        if (!user) throw `Token's user_email or user_id is wrong`;

        next();
    } catch (err) {
        res.status(401).json({
            message: `Invalid request: ${err}`,
        });
    }
};

module.exports = auth;