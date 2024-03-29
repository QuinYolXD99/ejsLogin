const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const PORT = 4000;
const cors = require("cors");
const url = require('url')
const mongoose = require("mongoose");
const AccountModel = require('./accountModel')
const multer = require('multer');

console.log("connecting....");
mongoose.connect("mongodb://localhost:27017/UserEJS", { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: true }, (err, data) => {
    if (err) {
        console.log("error : " + err);
    } else {
        console.log("database is connected!");
    }
});

var user = null,
    loggedIn = false



app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use('/files', express.static(path.join(__dirname, 'uploads')))
app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}));

function checkUser(user) {
    console.log(user);

    return new Promise((resolve, reject) => {
        AccountModel.findOne({ $or: [{ username: user.userKey, password: user.password }, { email: user.userKey, password: user.password }] }, (err, data) => {
            if (!err) {
                resolve(data)
            } else {
                reject(err)
            }
        })
    })
}
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        var filename = `uploads_${Math.round(+new Date() / 1000)}_${file.originalname}`
        cb(null, filename)
    }
})

var upload = multer({ storage: storage, limits: { fileSize: 1000000000 } })

app.get("/", (req, res) => {
    res.render("home", { page: 'Home' })
})
app.get('/dashboard', (req, res) => {
    if (loggedIn) {
        res.render('dashboard', { page: 'dashboard', user: user });
    } else {
        res.redirect('/account_login')
    }
})
app.get('/account_login', (req, res) => {
    if (loggedIn) {
        res.render('dashboard', { page: 'dashboard', user: user });
    } else {
        var error = req.query ? req.query.error : false
        res.render('login', { page: 'login', error: error })
    }

})
app.get('/register', (req, res) => {
    var error = req.query ? req.query.error : false
    var errorMessage = req.query ? req.query.errorMessage : ''
    res.render('register', { page: 'register', error: error, errorMessage: errorMessage })
})

app.post('/save', (req, res) => {
    // query to db
    checkUser(req.body).then(data => {
        if (data) {
            user = data
            loggedIn = true
            res.redirect("/dashboard")
        } else {
            res.redirect(url.format({
                pathname: "/account_login",
                query: { error: true },
            }))
        }
    }).catch(err => {
        res.send('something went wrong! \n' + err)
    })

})
app.post('/createAccount', upload.single('img'), (req, res) => {
    req.body.src = `http://localhost:${PORT}/files/${req.file.filename}`
    let newUser = new AccountModel(req.body);
    newUser
        .save()
        .then((new_user) => {
            user = new_user
            res.redirect('/account_login')
        })
        .catch(err => {
            res.redirect(url.format({
                pathname: "/register",
                query: {
                    error: true,
                    errorMessage: err
                },
            }))
        });
})

app.get('/logout', (req, res) => {
    user = null;
    loggedIn = false
    res.redirect('/account_login')
})

app.listen(PORT, () => {
    console.log(`Server is running on Port:${PORT}`);
});
