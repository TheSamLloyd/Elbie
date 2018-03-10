require("dotenv").config();
const http = require('http');
const express = require("express");
const requests = require('requests');
const fs = require('fs');
const app = express();
var PORT = 80;
app.get("/", function(req, res) {
	fs.readFile("index.html","utf8", function(err,data){
		res.send(data);
	})
});
app.listen(PORT, function() {
  console.log("App listening on PORT " + PORT);
});