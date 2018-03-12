require("dotenv").config();
const http = require('http');
const express = require("express");
const request = require('request');
const fs = require('fs');
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
app.use(cookieParser())
app.use('/api/discordauth', require('./api/discordauth'));
app.use("/public", express.static(__dirname + "/public"));
var PORT = (process.env.PORT || 80);
app.get("/", function(req, res) {
	res.sendFile(path.join(__dirname, "index.html"));
});
app.get("/dashboard",function(req,res){
	if (!req.cookies.token){
		res.redirect("/");
	}
	res.sendFile(path.join(__dirname,"dashboard.html"));
})
app.get("/user",function(req,res){
	console.log("user request");
	request.get("http://discordapp.com/api/users/@me").auth(null,null,true,req.cookies.token).pipe(res)
})
app.get("/guilds",function(req,res){
	console.log("server request");
	request.get("http://discordapp.com/api/users/@me/guilds").auth(null,null,true,req.cookies.token).pipe(res)
})
app.get("/campaigns",function(req,res){
	console.log("campaigns request");
	res.sendFile(path.join(__dirname,"Campaigns","campaigns.json"));
})
app.listen(PORT, function() {
  console.log("App listening on PORT " + PORT);
});

app.use((err, req, res, next) => {
  switch (err.message) {
    case 'NoCodeProvided':
      return res.status(400).send({
        status: 'ERROR',
        error: err.message,
      });
    default:
      return res.status(500).send({
        status: 'ERROR',
        error: err.message,
      });
  }
});