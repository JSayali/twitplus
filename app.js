var express = require('express');
var bodyParser=require("body-parser");
var cookieParser = require('cookie-parser')
var session = require("express-session");
var request=require('request');
var Twitter = require('twitter');
var app = express();

var sess;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({secret: "RQSHJD23HG"}));
app.use(bodyParser.json());
app.use(express.static('public'));


app.get('/checkSession',function(req,res) {
    sess = req.session;

    if(typeof sess.user != 'undefined')
    {
        var data=sess.user;
        res.send(data);
    }
    else
    {
        res.send("new");
    }
});


app.post("/register", function (req, res) {
    request({url: "http://localhost:3000/users?user_name="+req.body.user_name},
        function(error, response, body){
            console.log("in function request");
            var user = JSON.parse(body);
            console.log(user.user_name);
            if(user[0] == undefined){
                var data = {
                    "user_name": req.body.user_name,
                    "password": req.body.password
                };
                request.post({
                        url: "http://localhost:3000/users",
                        headers:{
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(data)
                    },
                    function(err, httpResponse, body){
                        var body = JSON.parse(body);
                        res.send(body);
                    });
            }
            else {
                res.send({id: false});
            }

        });

});

app.post('/tweet', function(req, res) {

  var tweet = req.body.tweet;
  var user=req.body.username;
  var userid=req.body.userid;
  var data= {
    "content": tweet,
    "user": user,
    "date": getDate(),
    "approved": false,
    "like": [userid],
    "dislike":[]};

    request.post({url:'http://localhost:3000/posts', headers:{'Content-Type': 'application/json'},body: JSON.stringify(data)}, function(err,httpResponse,body)
    {
    var body=JSON.parse(body);
    res.send(body);
    })
});


app.get('/loadTweets', function(req, res) {

        request('http://localhost:3000/posts', function (error, response, body) {
            if (!error && response.statusCode == 200) {
                res.send(JSON.parse(body));
            }
        })

});

app.get('/getVotes',function(req,res){

        var id=req.param("id");

        request('http://localhost:3000/posts/'+id, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                res.send(JSON.parse(body));
            }
        })

});
app.post('/login',function(req,res){

    var unm, pwrd;
    sess = req.session;
    user=req.body.user_name;
    pass=req.body.password;

    request('http://localhost:3000/users', function (error, response, body) {
            if (!error && response.statusCode == 200) {

                var flag=false;
                var data=JSON.parse(body);

                for (var i = 0; i < data.length; i++) {

                    unm = data[i].user_name;
                    pwrd = data[i].password;

                    if(user === unm && pass  === pwrd)
                    {
                        flag=true;
                        sess.user = data[i];
                        sess.save();
                        res.send(data[i]);
                    }
                }
                if(flag==false)
                    res.status(401).json({ error: 'message' });
            }
        });

  });

app.post('/updatePost',function(req,res){

        var data=req.body;

        var id=data.id;

        request({ url: 'http://localhost:3000/posts/'+id, method: 'PUT', json: data}, function(err,httpResponse,body){

            res.send(body);

        });
});

app.get("/logout",function(req,res){
    req.session.destroy();
    res.send("success");
});


app.post("/postTwitter",function(req,res){

        var tweet=req.body.tweet;

        request('http://localhost:3000/twitter', function (error, response, body) {
        if (!error && response.statusCode == 200) {

            var config=JSON.parse(body);
            config=config[0];

            var client = new Twitter({
                consumer_key: config.consumer_key,
                consumer_secret:config.consumer_secret,
                access_token_key:config.access_token_key,
                access_token_secret:config.access_token_secret
            });

            var params = {screen_name: 'cpsc473'};

            client.post('statuses/update', {status: tweet},  function(error, tweet, response){
                if(error) throw error;
                return;
            });
        }
            else {
            console.log(error);
        }

        })
});

function getDate(){
    var d = new Date();
    var month = d.getMonth()+1;
    var day = d.getDate();
    var output = GetMonthName(month)+ " "+day+", "+ d.getFullYear();
    return output;
}

/*get month name*/
function GetMonthName(monthNumber) {
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[monthNumber - 1];
}

app.listen(8000);

console.log("Server started on port:8000");