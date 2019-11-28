const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const PORT = 4000;
const cors = require("cors");
const url = require('url')
const mongoose = require("mongoose");
const AccountModel = require('./accountModel')
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

function checkUser(user) {
    return new Promise((resolve , reject)=>{
         AccountModel.findOne({username : user.username ,password:user.password},(err , data)=>{
            if (!err){
                user = data
                resolve(data)
            }else{
                reject(err)
            }
        })
    })
}

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

app.post('/save', (req, res) => {
    // query to db
    checkUser(req.body).then(data=>{
        if(data){
            res.render('home', { page: 'home', user })
        }else{
        res.redirect(url.format({
            pathname: "/account_login",
            query: { error: true },
        }))
        }
    }).catch(err=>{
        res.send('something went wrong! \n' + err )
    })
 
})
app.post('/createAccount', (req, res) => {
   let newUser = new AccountModel(reqBody);
            newUser
                .save()
                .then((new_user) => {
                    user = new_user
                    res.redirect('/account_login')
                })
                .catch(err => {
                   res.send('something went wrong! \n' + err )
                });

})
app.listen(PORT, () => {
    console.log(`Server is running on Port:${PORT}`);
});
