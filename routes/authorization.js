const express = require(`express`);
const db = require(`../handlers/database`);
const bcrypt = require(`bcrypt`);

const jwt = require(`jsonwebtoken`);
const { errorCatch } = require("../handlers/utils");

module.exports = {
    base_route: `/auth`,
    endpoints: [`/login`],
    handler: () => {
        const route = express.Router({ caseSensitive: false });

        route.post(`/check`, (req, res) => {
            try {
                var auth = req.headers.authorization;

                var token = Buffer.from(auth.split(" ")[1], `base64`).toString(`utf8`);

                let data = jwt.decode(token);

                let email = data.user_email;
                let user = getUser(email);
                if (!user) throw `No user found`;

                let verify = jwt.verify(token, user.salt + process.env.jwt_user_secret);
                res.status(200).json({
                    result: true,
                });
            } catch (err) {
                res.status(400).json({
                    result: false,
                });
            }
        });

        route.post(`/login`, (req, res) => {
            try {
                let errors = [];

                var tokenToVerify, clientToken;
                var user;

                var email = "x";
                if (!req.body) throw { code: 400, msg: `No body provided` };
                if (req.headers.authorization) {
                    clientToken = req.headers.authorization.split(` `)[1];
                    tokenToVerify = jwt.decode(Buffer.from(clientToken, `base64`).toString(`utf8`));
                }

                if (!tokenToVerify) {
                    var { email, password } = req.body;
                    !email ? errors.push `Missing email` : void 0;
                    !password ? errors.push `Missing password` : void 0;

                    if (errors.length > 0) throw { code: 400, msg: errors };

                    user = getUser(email);

                    if (!user) throw { code: 404, msg: `Wrong email` };

                    const password_hash = bcrypt.hashSync(password, user.salt);

                    if (user.password !== password_hash) throw { code: 401, msg: `Wrong password` };
                    if (user.status === "pending") throw { code: 403, msg: `Email not confirmed` };
                } else {
                    var email = tokenToVerify.user_email;

                    user = user = getUser(email);

                    if (!user) throw { code: 404, msg: `No user found` };
                    if (user.status === "pending") throw { code: 403, msg: `Email not confirmed` };

                    try {
                        const check = jwt.verify(clientToken, user.salt + process.env.jwt_user_secret);
                    } catch (error) {
                        throw { code: 400, msg: `Token expired, login again without token` };
                    }
                }

                let user_data = {
                    user_id: user.id,
                    user_email: user.email,
                };
                let sign = jwt.sign(user_data, user.salt + process.env.jwt_user_secret, { noTimestamp: true, expiresIn: `30d` });

                res.status(200).json({
                    message: `Succesfully logged in`,

                    user: {
                        email: user.email,
                        id: user.id,
                        access_token: sign,
                    },
                });
            } catch (err) {
                if (err.code) {
                    errorCatch(res, err.code, err.msg);
                }
                console.log(err);
            }
        });

        return route;
    },
};

function getUser(email) {
    let query = `select * from users where email='${email}'`;
    return db.prepare(query).get();
}