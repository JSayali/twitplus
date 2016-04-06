"use strict";

var session;
var limit;

/*Display posts with upvote, downvote*/
var displayName = function(id, tweet, user, date, up, down, upNoDown) {

    var label1, label2;
    var labelupActive = "<label class=\"btn btn-default up active\">";
    var labelDownActive = "<label class=\"btn btn-default down active\">";
    var labelUp = "<label class=\"btn btn-default up\">";
    var labelDown = "<label class=\"btn btn-default down \">";

    /*if user has upvoted the post, then set class = active to label to keep button selected.*/
    if (upNoDown === "up") {
        label1 = labelupActive;
        label2 = labelDown;
    }
    /*if user has downvoted the post, then set class = active to label to keep button selected.*/
    else if (upNoDown === "down") {
        label1 = labelUp;
        label2 = labelDownActive;
    }
    /*not yet upvoted/downvoted.Both buttons unselected*/
    else {
        label1 = labelUp;
        label2 = labelDown;
    }

    var post = "<div id=\"" + (id) + "\" class=\"post-preview \"> <h2 class=\"post-title\">" + tweet + " </h2> <p class=\"post-meta\">" +
        "Posted by <span class=\"username\">" + user + "</span> on <span class=\"date\">" + date + "</span></p> <div class=\"btn-group btn-group-sm upDown\" " +
        "data-toggle=\"buttons\">" + label1 + "<input type=\"radio\" class= \"up\" autocomplete=\"off\"> " +
        "<span class=\"glyphicon glyphicon-thumbs-up up\" aria-hidden=\"true\"></span><span class=\"up upvotes\">" + up + "</span>" +
        " </label>" + label2 + " <input type=\"radio\" class = \"down\" autocomplete=\"off\"><span class=\"glyphicon glyphicon-thumbs-down down\" aria-hidden=\"true\"></span></span><span class=\"down downvotes\">" +
        down + "</span> </label> </div><hr></div> ";

    /*prepend to show the latest post on top*/
    $("#posts").prepend(post);

};

// Load all tweets for group
var loadTweets = function() {
    var countFlag = false;
    var ajaxFn = function() {
        $.ajax({
            url: "http://localhost:8000/loadTweets",
            type: "GET",
            dataType: "json",
            success: function(postData) {
                $("div#posts").html("");
                $(".userArea").removeClass("hide");

                var loginuser = "";
                loginuser += session.id;
                postData.forEach(function(postData) {

                    if (postData.approved === false) {
                        countFlag = true;
                        var likearr = postData.like;
                        var upcount = likearr.length;

                        var dislikearr = postData.dislike;
                        var dcount = dislikearr.length;

                        var updown;
                        if (likearr.indexOf(loginuser) !== -1) {
                            updown = "up";
                        } else if (dislikearr.indexOf(loginuser) !== -1) {
                            updown = "down";
                        } else {
                            updown = "no";
                        }
                        displayName(postData.id, postData.content, postData.user, postData.date, upcount, dcount, updown);
                    }
                });
                if (countFlag === false) {
                    $("#postsAlert .alert").text("Currently, there are no posts to show.");
                    $("#postsAlert .alert").removeClass("hide");
                }
            }
        });
    };
    setTimeout(ajaxFn, 1000);

};

$(document).ready(function() {

    $.get("http://localhost:8000/checkSession", function(data) {

        if (data !== "new") {
            session = data.user;
            session.members = data.members;
            console.log("members: " + session.members);

            limit = Math.ceil(session.members / 2);
            console.log("Limit checksession: " + limit);

            $("a#user").append(" " + session.user_name + "!");
            $(".firstTask").addClass("hide");
            $(".loginDone").removeClass("hide");
            $("button[type=submit]").prop("disabled", true);

            loadTweets();
        }
    });
});

/*Add user's new post*/
$("#tweetPost").submit(function(event) {

    event.preventDefault(); /**Ketul**/

    var tweet = $("#tweet").val();
    var data = {
        "tweet": tweet,
        "username": session.user_name,
        "userid": session.id
    };

    $.ajax({
        url: "http://localhost:8000/tweet",
        type: "POST",
        data: data,
        dataType: "json",
        success: function(postData) {

            $("#tweet").val("");
            $("button[type=submit]").prop("disabled", true);
            $("#postsAlert .alert").addClass("hide");

            var likearr = postData.like;
            var upcount = likearr.length;

            displayName(postData.id, postData.content, postData.user, postData.date, upcount, 0, "up");
        }
    });
});

/*Upload post to twitter*/
var postTweet = function(tweet, postId) {
    var data = {
        "tweet": tweet
    };
    console.log("Inside postTweet client.js Tweet:" + tweet);

    var ajaxFctn = function() {
        $.ajax({
            url: "http://localhost:8000/postTwitter",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(data),
            dataType: "json",
            success: function(updatedData) {
                if (updatedData.success === true) {
                    var select = "#" + postId;
                    $(select).html("<div class=\"alert alert-success alert-dismissible\" role=\"alert\"> " +
                        "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
                        "<span aria-hidden=\"true\">&times;</span></button> <strong>Great!</strong> " +
                        "Tweet posted to your account. </div>");
                }

            }
        });
    };
    setTimeout(ajaxFctn, 3000);
};

// Updates tweet
var updatePost = function(data) {
    $.ajax({
        url: "http://localhost:8000/updatePost",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(data),
        dataType: "json",
        success: function(updatedData) {
            var count = (updatedData.like).length;

            if (count === limit) {
                postTweet(updatedData.content, updatedData.id);

            }
        }
    });
};

/*Handle upvote downvote functionality*/
$("#posts").delegate("label", "click", function(e) {

    var target = $(e.target);
    var lab = target.closest("label");

    if (lab.hasClass("active")) {
        console.log("already selected");
    } else {
        var $div = target.closest("div.post-preview");
        var id = $div.attr("id");

        var up = 0;
        var down = 0;
        var likearr = [];
        var dislikearr = [];

        $.ajax({
            url: "http://localhost:8000/getVotes?id=" + id,
            type: "GET",
            dataType: "json",
            success: function(postData) {

                likearr = postData.like;

                dislikearr = postData.dislike;

                var usern = "";
                usern += session.id;


                if (target.hasClass("up")) {

                    if (dislikearr.indexOf(usern) !== -1) {
                        dislikearr.splice(dislikearr.indexOf(usern), 1);
                    }
                    likearr.push(usern);

                    up = likearr.length;
                    down = dislikearr.length;

                    $div.find("span.upvotes").text(up);
                    $div.find("span.downvotes").text(down);

                    postData.like = likearr;
                    postData.dislike = dislikearr;

                    if (up === limit) {
                        postData.approved = true;
                    }
                    updatePost(postData);
                } else if (target.hasClass("down")) {

                    usern = "";
                    usern += session.id;

                    if (likearr.indexOf(usern) !== -1) {
                        likearr.splice(likearr.indexOf(usern), 1);
                    }
                    dislikearr.push(usern);

                    up = likearr.length;
                    down = dislikearr.length;

                    $div.find("span.upvotes").text(up);
                    $div.find("span.downvotes").text(down);

                    postData.like = likearr;
                    postData.dislike = dislikearr;


                    if (up === limit) {
                        postData.approved = true;
                    }
                    updatePost(postData);

                }
            }
        });
    }
});

/*Display field error*/
var err = function(sel) {
    var $pDiv = $(sel).parent();
    $pDiv.append("<span class=\"glyphicon glyphicon-remove form-control-feedback\"></span>");
    $pDiv.fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
    var $gpDiv = $pDiv.parent();
    $gpDiv.addClass("has-error");

};

/*Handle login*/
$("#loginModal").delegate("#login", "click", function(event) {

    event.preventDefault();
    var username, passwrd;
    if (!$("#user-name").val()) {
        err("#user-name");
    } else if (!$("#password").val()) {
        err("#password");

    } else {
        username = $("#user-name").val();
        passwrd = $("#password").val();

        var data = {
            "user_name": username,
            "password": passwrd
        };

        $.ajax({
            url: "http://localhost:8000/login",
            type: "POST",
            data: JSON.stringify(data),
            dataType: "json",
            contentType: "application/json",
            success: function(logindata) {
                var session = logindata.data;
                session.members = logindata.total;

                var limit = Math.ceil(session.members / 2);
                console.log("Limit login: " + limit);

                console.log("Total users: " + session.members);
                $("#loginModal").modal("hide");
                var loginname = session.user_name;

                $("a#user").append(" " + loginname + "!");

                $(".firstTask").addClass("hide");
                $(".loginDone").removeClass("hide");

                $(".heading").removeClass("hide");

                $("button[type=submit]").prop("disabled", true);

                loadTweets();

            },
            error: function(data) {
                $(".alert").removeClass("hide");
                console.log("error: " + data);

            }
        });
    }
});

$("#loginModal, #signupModal").on("shown.bs.modal", function() {
    $(".focusOnOpen").focus();
});

$(".goToNext").keyup(function(event) {
    if (event.keyCode === 13) {
        $("#login, #newSignUp").click();
    }
});


/*Disable and enable submit button by checking the textarea contents*/
$("#tweet").keyup(function() {
    $("button[type=submit]").prop("disabled", this.value === "" ? true : false);
});

/*Remove field errors on keypress*/
$("input").on("click keypress", function() {
    /*$(this).parent().parent().removeClass("has-error");*/
    $("div.has-error").removeClass("has-error");
    $("span.glyphicon-remove").remove();
    $(".alert").addClass("hide");
});

/*Clear modal on close*/
$(".modal").on("hidden.bs.modal", function() {
    $(this).find("form")[0].reset();
    $(this).find("div.has-error").removeClass("has-error");
    $("span.glyphicon-remove").remove();
    $(".alert").addClass("hide");
});

/*Handle new user sign-up*/
$("#newSignUp").on("click", function(event) {

    event.preventDefault();
    var newUser, newPass, cnfrmPass;

    newUser = $("#newUserName").val();
    newPass = $("#newUserPass").val();
    cnfrmPass = $("#cnfrmPass").val();

    if (!newUser) {
        err("#newUserName");
    } else if (!newPass) {
        err("#newUserPass");
    } else if (!cnfrmPass) {
        err("#cnfrmPass");
    } else if ($.isNumeric(newUser)) {
        err("#newUserName");
        $("#signupAlert strong").text("Cannot have numeric values.");
        $("#signupAlert").removeClass("hide");
    } else if ($.isNumeric(newPass)) {
        err("#newUserPass");
        $("#signupAlert strong").text("Cannot have numeric values.");
        $("#signupAlert").removeClass("hide");
    } else if (newPass !== cnfrmPass) {
        $("#signupAlert strong").text("Passwords do not match.");
        $("#signupAlert").removeClass("hide");
        err("#newUserPass");
        err("#cnfrmPass");
    } else {
        var data = {
            "user_name": newUser,
            "password": newPass
        };

        var ajaxF = function() {
            $.ajax({
                url: "http://localhost:8000/register",
                type: "POST",
                data: data,
                dataType: "json",
                success: function(data) {
                    console.log(data);
                    console.log("in success" + data.id);
                    if (data.id !== false) {
                        console.log("new user created. " + data.id);
                        $("#signupModal").modal("hide");
                    } else {
                        console.log("Username is not available.");
                        err("#newUserName");
                        $("#signupAlert strong").text("Username is not available.");
                        $("#signupAlert").removeClass("hide");
                    }
                },
                error: function(error) {
                    console.log(error);
                }
            });
        };
        setTimeout(ajaxF, 3000);
    }


});

$("#logout").on("click", function() {

    $(".firstTask").removeClass("hide");
    $(".loginDone").addClass("hide");
    $(".userArea").addClass("hide");
    $("#post").html("");
    $.get("http://localhost:8000/logout", function() {
        location.reload();
    });
});
