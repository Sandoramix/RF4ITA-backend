require(`dotenv`).config(`../`);
const db = require("./database");
const jwt = require(`jsonwebtoken`);
const bcrypt = require(`bcrypt`);

let args = process.argv;

function main() {
    if (args.length < 4) return console.log(`Usage: node ${__filename} <email> <password>`);
    let email = args[2].toLowerCase(),
        password = args[3];

    var query = `select * from users where email='${email}'`;
    if (db.prepare(query).all().length > 0) return console.log({ code: 409, msg: `Email is already used!` });

    const user_salt = bcrypt.genSaltSync(12);
    const password_hash = bcrypt.hashSync(password, user_salt);
    const user_email = email.toLowerCase();

    let time = new Date();

    let day = time.getDate().toString().padStart(2, `0`),
        year = time.getUTCFullYear(),
        month = time.getMonth().toString().padStart(2, `0`);

    query = `INSERT INTO users(created_at,email,password,salt) VALUES('${year}-${month}-${day}',?,?,?)`;
    let user = db.prepare(query).run(user_email, password_hash, user_salt);

    data = {
        user_id: user.id,
        user_email: email,
    };
    let token = jwt.sign(data, process.env.jwt_secret);
    data.password = password;
    data.token = token;

    console.log(`Registered new user: ${JSON.stringify(data)}`);
}

main();