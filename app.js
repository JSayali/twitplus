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
app.use(session(
    {
        secret: '1234567890QWERTY',
        resave: false,
        saveUninitialized: true,
        cookie: {secure: false}
    }
));
app.use(bodyParser.json());
app.use(express.static('public'));

/*GIVING ERROR THE FIRST TIME WEBSITE IS ACCESSED - NEED TO FIX*/
app.get("/getGroups", function(req, res){
    console.log("inside getgroups");
    request('http://localhost:3000/groups', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.send(JSON.parse(body));
        }
    })
});

app.post("/register", function (req, res) {
    var data = {
       "user_name": req.body.user_name,
       "password": req.body.password,
       "member_of": []
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

});

app.post('/tweet', function(req, res) {
   /* if(sess.userid){*/
        var tweet = req.body.tweet;
        var user=req.body.username;
        var userid=req.body.userid;
        var group = req.body.group;
        var data= {
            "content": tweet,
            "user": user,
            "date": getDate(),
            "group": group,
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
                        res.send(data[i]);
                        sess.userid = data[i].id;
                        console.log("session id: "+sess.userid);
                    }
                }
                if(flag==false)
                    res.status(401).json({ error: 'message' });
            }
    });

});

/*create new group*/
app.post("/createGroup", function(req, res){
    var data = {
        "group_name": req.body.group_name,
        "twitterScr": req.body.twitterScr
    };
    request.post({
            url: "http://localhost:3000/groups",
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        },
        function(err, httpResponse, body){
            var body = JSON.parse(body);
            res.send(body);
        });
});

/*add the group id to the details of the user who created the group
* GIVES ERROR SOMETIMES -  NEED TO FIX*/
app.post("/adminUser", function(req, res){
    console.log("inside post");
    var member_of=[];
    var user_id = req.body.user_id;
    var groups = req.body.groups;
    console.log("Group members: "+groups);
    member_of = {
        member_of: groups
    };
    request({ url: 'http://localhost:3000/users/'+user_id, method: 'PATCH', json: member_of},
        function(error,httpResponse,body){
            if(!error){
                console.log("Admin user added.");
                res.send({success: "done"});
            }

        });
});

/*look for the usernames added by while creating the group and add the group id to the user's details.
* GIVES ERROR IF INVALID USERNAME IS GIVEN - NEED TO FIX*/
app.post("/getUser", function(req, res){
    var invalidUsers = [];
    var member = req.body.member;
    var group = req.body.group;
    console.log("member: "+member);
    /*res.send({success: "done"});*/

    request("http://localhost:3000/users?user_name="+member,
        function(error,response,body){
            var data, id, groupList=[], member_of;
            if (!error && response.statusCode == 200) {
                console.log(body.length);
                data = JSON.parse(body);
                id = data[0].id;
                console.log(data[0].id);
                groupList = data[0].member_of;
                console.log(groupList);
                if(groupList.indexOf(group)!==-1)
                    console.log("already present");
                else
                {
                    groupList.push(group);
                    console.log(groupList);
                    member_of = {
                        member_of: groupList
                    };
                    request({ url: 'http://localhost:3000/users/'+id, method: 'PATCH', json: member_of},
                        function(error,httpResponse,body){
                        if(!error && response.statusCode == 200){
                            console.log("patch done");
                        }

                    });
                }

                res.send({success: "done"});
            }
            else {

                res.send({success: "no user found"});
            }
        }
     )
});
function updateUsergroup(members){
    console.log("in updateusergroup");
    var invalidUsers = [];
    request({
        url: "http://localhost:3000/users?name="+members[0],
        function(err,response,body){
            console.log("member 0: "+members[0]);
            if (!error && response.statusCode == 200) {
                console.log(body.id);
                members.splice(0,1);
                if(members.length!==0)
                    updateUsergroup(members);
                else
                    res.send({success: invalidUsers});
            }
            else {
                invalidUsers.push(members[0]);
                console.log(members[0]);
                res.send({success: invalidUsers});
            }
        }
    })
}
app.post('/updatePost',function(req,res){
    var data=req.body;

    var id=data.id;

        request({ url: 'http://localhost:3000/posts/'+id, method: 'PUT', json: data}, function(err,httpResponse,body){

            res.send(body);

        });
    }
);

app.post("/postTwitter",function(req,res){
   /* if(sess.userid){
        console.log("response: "+res.body);*/
        var tweet=req.body.tweet;

        var client = new Twitter({
            consumer_key: 'wdupZpyaeLjCvqhsrJsDp20ix',
            consumer_secret:'xsAzRqdU32W59Ow2OjhAtyex7WozQwWClc1Vf7bOYoIYTKHHYs',
            access_token_key:'706613428790566912-BYASC0htSA2V2bcB2Ps4OmQdpwj3s40',
            access_token_secret:'L8SL9Na2RwZ6c12r4HlxVJkXQnC5CqHn60GQjoWxYINmT'
        });

        var params = {screen_name: 'cpsc473'};


        client.post('statuses/update', {status: tweet},  function(error, tweet, response){
            if(error) throw error;
            console.log(tweet);  // Tweet body.
            console.log(response);  // Raw response object.
            return;
        });
    /*}
    else {
        console.log("please login");
        res.render("public/index.html");
    }
*/

});

/*Get today's date. Format: MonthName day, year */
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