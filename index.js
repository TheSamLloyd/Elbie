require("dotenv").config();
const http = require('http');
const express = require("express");
const requests = require('requests');
const fs = require('fs');
const app = express();
const path = require("path");
var PORT = 80;
app.get("/", function(req, res) {
	res.sendFile(path.join(__dirname, "index.html"));
});
app.listen(PORT, function() {
  console.log("App listening on PORT " + PORT);
});