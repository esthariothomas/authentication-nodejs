//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const port = 3000;
const mongoose = require("mongoose");
const { stringify } = require("qs");
//encryption
// const encrypt = require("mongoose-encryption");

//hashing using md5
// const md5 = require("md5");
// const bcrypt = require("bcrypt");
// const saltRounds = 10;
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
//passport-local ga perlu di require

const app = express();

// console.log(process.env.SECRET);

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
    secret: "Our litte secret.",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);

//ganti ke new mongoose.Schema buat pake mongoose encryption
const userSchema = new mongoose.Schema({
    email: String,
    password: String 
});

userSchema.plugin(passportLocalMongoose);

// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ['password']});

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', (req, res) => {
    res.render("home");
});

app.get('/login', (req, res) => {
    res.render("login");
});

app.get('/register', (req, res) => {
    res.render("register");
});

app.get('/secrets', (req, res) => {
    if(req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("login");
    }
});

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
})

app.post('/register', (req, res) => {
    //INI KALO PAKE BCRYPT
    // bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    //     const newUser = new User({
    //         email: req.body.username,
    //         password: hash
    //     });
    //     newUser.save((err) => {
    //         if(!err) {
    //             res.render("secrets");
    //         } else {
    //             console.log(err);
    //         }
    //     });
    // });
    User.register({username: req.body.username}, req.body.password, (err, user) => {
        if(err) {
            console.log(err);
            res.redirect('/register');
        } else {
            passport.authenticate("local")(req, res, () => {
                res.redirect('/secrets');
            })
        }
    })
});

app.post('/login', (req, res) => {
    // INI KALO PAKE BYCRYPT
    // const username = req.body.username;
    // const password = req.body.password;

    // User.findOne({email: username}, (err, foundUser) => {
    //     if(err) {
    //         console.log(err);
    //     } else {
    //         if (foundUser) {
    //             bcrypt.compare(password, foundUser.password, function(err, result) {
    //                 // result == true
    //                 if(result === true) {
    //                     res.render("secrets");
    //                 }   
    //             });
    //         }
    //     }
    // });
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, (err) => {
        if(err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, () => {
                res.redirect('/secrets');
            });
        }
    })
});

app.listen(port, () => {
    console.log("Server started on port 3000");
});