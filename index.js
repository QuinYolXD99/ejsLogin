const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const PORT = 4000;
const cors = require("cors");
const url = require('url')
const mongoose = require("mongoose");
console.log("connecting....");
mongoose.connect("mongodb://localhost:27017/UserEJS", { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: true }, (err, data) => {
    if (err) {
        console.log("error : " + err);
    } else {
        console.log("database is connected!");
    }
});

var users = [],
    user = null


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded())
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/', (req, res) => {
    if (user) {
        res.render('home', { page: 'home', user: user });
    } else {
        res.redirect('/account_login')
    }
})
app.get('/account_login', (req, res) => {
    var error = req.query ? req.query.error : false

    res.render('login', { page: 'login', error: error })
})
app.get('/register', (req, res) => {
    res.render('register', { page: 'register'})
})
function userExists(user) {
    return users.some(function (el) {
        return el.email === user.email && el.password == user.password;
    });
}
app.post('/save', (req, res) => {
    // query to db
    if (userExists(req.body)) {
        res.render('home', { page: 'home', user })
    } else {
        res.redirect(url.format({
            pathname: "/account_login",
            query: { error: true },
        }))

    }
})
app.post('/createAccount', (req, res) => {
    users.push(req.body);
    user = req.body
    res.redirect('/account_login')
})
app.listen(PORT, () => {
    console.log(`Server is running on Port:${PORT}`);
});