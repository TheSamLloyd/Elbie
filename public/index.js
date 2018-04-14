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
app.get("/template", function(req,res){
	res.sendFile(path.join(__dirname,"template.html"))
})
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
app.get("/elbie",function(req,res){
	var options={
		url:"https://api.heroku.com/apps/landon-bot/dynos",
		headers:{
		"Authorization":"Bearer "+process.env.HEROKU_TOKEN,
		"Accept":"application/vnd.heroku+json; version=3"
		}
	};
	request.get(options, function(err, resp, data){
		var workers = JSON.parse(data).filter(function(obj){console.log(obj.type); return obj["type"]=="worker"});
		console.log(workers)
		var version=workers[0].release.version;
		var state = workers[0].state;
		var output = {
			"version":version,
			"state":state
		}
		res.send(output);
	});
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