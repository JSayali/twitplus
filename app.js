// Node modules for Project
var express = require('express');
var bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
var session = require("express-session");
var request = require('request');
var Twitter = require('twitter');
var app = express();

// Session data variable
var sess;

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(session({
    secret: "RQSHJD23HG"
}));
app.use(bodyParser.json());
app.use(express.static('public'));

// Check to see if a session exists for login
//   If user aready has a session it reloads it, if not
//   new session data is created.
app.get('/checkSession', function(req, res) {
    sess = req.session;

    if (typeof sess.user != 'undefined') {
        var data = sess;
        res.send(data);
    } else {
        res.send("new");
    }
});

// Create an account.
//    Adds username and password to database on success
app.post("/register", function(req, res) {
    request({
            url: "http://localhost:3000/users?user_name=" + req.body.user_name
        },
        function(error, response, body) {

            var user = JSON.parse(body);

            if (user[0] === undefined) {
                var data = {
                    "user_name": req.body.user_name,
                    "password": req.body.password
                };
                request.post({
                        url: "http://localhost:3000/users",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(data)
                    },
                    function(err, httpResponse, body) {
                        body = JSON.parse(body);
                        res.send(body);
                    });
            } else {
                res.send({
                    id: false
                });
            }

        });

});

// Add new tweet
//    Adds tweet to database on success
app.post('/tweet', function(req, res) {

    var tweet = req.body.tweet; // Tweet text
    var user = req.body.username; // Posting user
    var userid = req.body.userid; // Unique user id
    var data = {
        "content": tweet,
        "user": user,
        "date": getDate(),
        "approved": false,
        "like": [userid],
        "dislike": []
    };

    request.post({
        url: 'http://localhost:3000/posts',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }, function(err, httpResponse, body) {
        body = JSON.parse(body);
        res.send(body);
    });
});

// Load all tweets associated with Group
app.get('/loadTweets', function(req, res) {

    request('http://localhost:3000/posts', function(error, response, body) {
        if (!error && response.statusCode == 200) {
            res.send(JSON.parse(body));
        }
    });

});

// Getting all vote counts for a specific tweet
app.get('/getVotes', function(req, res) {

    var id = req.param("id");

    request('http://localhost:3000/posts/' + id, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            res.send(JSON.parse(body));
        }
    });

});

// Login to application
//   Updates session data
app.post('/login', function(req, res) {

    var unm, pwrd; // Username and password of user
    sess = req.session; // Session data
    user = req.body.user_name; // Username
    pass = req.body.password; // Password

    request('http://localhost:3000/users', function(error, response, body) {
        if (!error && response.statusCode == 200) {

            var flag = false;
            var data = JSON.parse(body);

            for (var i = 0; i < data.length; i++) {

                unm = data[i].user_name;
                pwrd = data[i].password;

                if (user === unm && pass === pwrd) {
                    flag = true;
                    sess.user = data[i];
                    sess.members = data.length;
                    sess.save();

                    res.send({
                        data: data[i],
                        total: data.length
                    });
                }
            }
            if (flag === false)
                res.status(401).json({
                    error: 'message'
                });
        }
    });

});

// Posting additions to tweets
app.post('/updatePost', function(req, res) {

    var data = req.body; // Request body

    var id = data.id; // Tweet unique id

    request({
        url: 'http://localhost:3000/posts/' + id,
        method: 'PUT',
        json: data
    }, function(err, httpResponse, body) {

        res.send(body);

    });
});

// Logout of Application
//    Updates session data
app.get("/logout", function(req, res) {
    req.session.destroy();
    res.send("success");
});

// Post tweet to Twitter
app.post("/postTwitter", function(req, res) {

    var tweet = req.body.tweet;
    console.log("tweet" + tweet);

    var client = new Twitter({
        consumer_key: "wdupZpyaeLjCvqhsrJsDp20ix",
        consumer_secret: 'xsAzRqdU32W59Ow2OjhAtyex7WozQwWClc1Vf7bOYoIYTKHHYs',
        access_token_key: '706613428790566912-BYASC0htSA2V2bcB2Ps4OmQdpwj3s40',
        access_token_secret: 'L8SL9Na2RwZ6c12r4HlxVJkXQnC5CqHn60GQjoWxYINmT'
    });

    var params = {
        screen_name: 'cpsc473'
    };

    client.post('statuses/update', {
        status: tweet
    }, function(error, tweet, response) {
        if (error) throw error;
        console.log(tweet); // Tweet body.
        console.log(response); // Raw response object.
        res.send({
            "success": true
        });
    });

});

// Get formatted data for tweet listings
function getDate() {
    var d = new Date();
    var month = d.getMonth() + 1;
    var day = d.getDate();
    var output = GetMonthName(month) + " " + day + ", " + d.getFullYear();
    return output;
}

// Get formatted month name
function GetMonthName(monthNumber) {
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[monthNumber - 1];
}

app.listen(8000);

console.log("Server started on port:8000");
