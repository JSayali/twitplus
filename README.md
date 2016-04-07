**CPSC 473 - Web Programming and Data Management**
## 
Section: 01
Project 1 – Spring 2016



**Twitter +**








**Section 1, Team 1 - “Acerbic Unseemliness”**
##
* Shah, Ketul Pankajkumar
*	Alfayez, Sarah Fahad
*	Joshi, Sayali Pradeep
*	Edwards, Joseph John
*	Hoxie, David Matthew

##
**Project Description:**
##
  Twitter+ is a web application that serves as a Twitter gateway for groups of people in companies, schools, departments, or anywhere else. It is a single web application with only one html file (index.html). It allow users to post a tweet to a specific Twitter account as a group. Each group member can add a post and each team member should vote either with an up vote or down vote. If the votes reach half or more of the group members, the post will be posted to the Twitter account directly. For the time being of this project, there is only one group and one Twitter account @cpsc473. All group member accounts created will be linked to this group and this Twitter account.
  
##
**Application functionalities:**
*	Sign up to create a username and password.
*	Sign in to access the account using username and password identified in the sign up process.
*	A user can write a post that will be viewed to all group members.
*	An automatic up vote will be given to the member wrote the post.
*	Each member can up vote other members posts.
*	Each member can down vote other members posts.
*	A post will be posted to the Twitter account half or more of the group members have decided to up vote.
*	A Twitter embedded timeline for the account appears on the home page of the application to view the recent posts.  
*	The application has session functionality that is when the user’s page is refreshed; the user will not be logged out.  
*	Logout of the application.

##
**Application Pre-requisites:**
##
1.	Node.js and npm.
2.	Json-server module.
3.	Git
4.	Internet connection.
5.	HTTP server running on port 8000 (Make sure the port is available).
6.	Json-server running on port 3000 (Make sure the port is available).

##
**Installation and Setup Instructions:**
##
1.	Download or clone the Twitter + repository from GitHub using the following URL: https://github.com/JSayali/twitplus
2.  Download and install node.js 
3.	Install all dependencies specified in the package.json file which are:
  *	body-parser
  *	cookie-parser
  *	debug
  *	express-session
  *	express
  *	jade
  *	morgan
  *	request
  *	serve-favicon
  *	twitter
4.	Run the application using the following commands:
  *	node app.js 
  *	cd databases then run json-server db.json

