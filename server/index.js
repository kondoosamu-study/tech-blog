const consola = require('consola')
// 以下session用モジュール
const express = require('express')
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');

const { Nuxt, Builder } = require('nuxt')
const app = express()

// Import and Set Nuxt.js options
const config = require('../nuxt.config.js')
config.dev = process.env.NODE_ENV !== 'production'

async function start() {
    // Init Nuxt.js
    const nuxt = new Nuxt(config)

    const { host, port } = nuxt.options.server

    // Build only in dev mode
    if (config.dev) {
        const builder = new Builder(nuxt)
        await builder.build()
    } else {
        await nuxt.ready()
    }

    // 以下express-sessionモジュールの設定
    // sessionの保持はメモリ上に行う為、スケールするならFireStorageに行う。（もしくはRedis）
    app.use(cookieParser());
    app.use(session({
        secret: 'tech_blog',
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 60 * 60 * 1000,
            httpOnly: true,
            // secure: true if production (https),
            sameSite: true
        }
    }));

    // req.bodyを使用する為の定義
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    app.post('/', (req, res) => {
        // 値を保存する
        req.session.loggedIn = req.body.loggedIn;
        req.session.user = req.body.user;
        req.session.email = req.body.email;
        res.send("Save session about server/index.js loggedIn is " + req.session.loggedIn + " user is " + req.session.user + " email is " + req.session.email);
    });

    app.get('/auth-check', (req, res) => {
        if(req.session) {
            res.send({ loggedIn: req.session.loggedIn, user: req.session.user, email: req.session.email });
        } else {
            res.send({ loggedIn: false, user: null, email: null });
        }
    })

    // 下記は/testにしているが、/mng以下に入ったら認証を行い認証情報が残っていればそのまま/mngに残す
    // app.get('/mng/login', (req, res) => {
    //     res.send({ loggedIn: req.session.loggedIn, user: req.session.user, email: req.session.email });
    // })

    // Give nuxt middleware to express
    app.use(nuxt.render)


    // Listen the server
    app.listen(port, host)
    consola.ready({
        message: `Server listening on http://${host}:${port}`,
        badge: true
    })
}
start()
