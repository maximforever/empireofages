
/* dependencies */
const http = require("http");
const fs = require("fs");                               // file system
const path = require("path");                           // access paths
const express = require("express");                     // express
var https = require('https');                           // enable https support
const MongoClient = require('mongodb').MongoClient;     // talk to mongo
const bodyParser = require('body-parser');              // parse request body
var session = require('express-session');               // create sessions
const MongoStore = require('connect-mongo')(session);   // store sessions in Mongo so we don't get dropped on every server restart

const app = express();
app.set("port", process.env.PORT || 3000)                        // we're gonna start a server on whatever the environment port is or on 3000
app.set("views", path.join(__dirname, "/public/views"));        // tells us where our views are
app.set("view engine", "ejs");                                  // tells us what view engine to use

app.use(express.static('public'));                              // sets the correct directory for static files we're going to serve - I believe this whole folder is sent to the user

const dbops = require("./server/dbops");
const database = require("./server/database");

if(process.env.LIVE){                                                                           // this is how I do config, folks. put away your pitforks, we're all learning here.
    dbAddress = "mongodb://" + process.env.MLAB_USERNAME + ":" + process.env.MLAB_PASSWORD + "@ds243325.mlab.com:43325/empireofages";
} else {
    dbAddress = "mongodb://localhost:27017/empireofages";
}

MongoClient.connect(dbAddress, function(err, db){
    if (err){
        console.log("MAYDAY! MAYDAY! Crashing.");
        return console.log(err);
    } else {

    }

    app.use(bodyParser.urlencoded({
        extended: true
    }));

    app.use(bodyParser.json());                         // for parsing application/json

    var thisDb = db;

    var sessionSecret = process.env.SESSION_SECRET || "ejqjxvsh994hw8e7fl4gbnslvt3";

    app.use(session({                                
            secret: sessionSecret,             
            saveUninitialized: false,
            resave: false,
            secure: false,
            expires: null,
            cookie: {
                maxAge: null
            },/*
            store: new MongoStore({ 
                db: thisDb,
                ttl: 60*60*12,                  // in seconds - so, 12 hours total. Ths should hopefully expire and remove sessions for users that haven't logged in
                autoRemove: 'native'
            })*/
    }));

    app.use(function(req, res, next){                                           // logs request URL
        
        var timeNow = new Date();
        console.log("-----> " + req.method.toUpperCase() + " " + req.url + " on " + timeNow); 

        next();
    });


/* ROUTES */

    app.get("/", function(req, res){
        res.render("index");
    });



/* END ROUTES */


    /* 404 */

    app.use(function(req, res) {
        res.status(404);
        req.session.error = "404 - page not found!";
        res.redirect("/");
    });

    app.listen(app.get("port"), function() {
        console.log("Server started on port " + app.get("port"));
    });
});
