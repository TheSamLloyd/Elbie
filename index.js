require("dotenv").config();
const http = require('http');
const express = require("express");
const requests = require('requests');
const fs = require('fs');
const app = express();
const path = require("path");
app.use('/api/discordauth', require('./api/discordauth'));
var PORT = (process.env.PORT || 80);
app.get("/", function(req, res) {
	res.sendFile(path.join(__dirname, "index.html"));
});
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