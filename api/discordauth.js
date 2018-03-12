require("dotenv").config();
const fetch = require('node-fetch');
const btoa = require('btoa');
const { catchAsync } = require('../utils');
const express = require('express');
const router = express.Router();
const COOKIE_SECRET = process.env.COOKIE_SECRET;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
var redirect = 'api/discordauth/callback';
router.get('/login', (req, res) => { 
  redirect = encodeURIComponent("http://"+req.headers.host+"/api/discordauth/callback");
  res.redirect(`https://discordapp.com/oauth2/authorize?client_id=${CLIENT_ID}&scope=identify%20guilds&response_type=code&redirect_uri=${redirect}`);
});
router.get('/callback', catchAsync(async (req, res) => {
  if (!req.query.code) throw new Error('NoCodeProvided');
  redirect = encodeURIComponent("http://"+req.headers.host+"/api/discordauth/callback");
  const code = req.query.code;
  const creds = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
  const response = await fetch(`https://discordapp.com/api/oauth2/token?grant_type=authorization_code&code=${code}&redirect_uri=${redirect}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${creds}`,
      },
    });
  const json = await response.json();
  var token = json.access_token;
  res.cookie("token",token)
  res.redirect(`/dashboard`);
}));
module.exports = router;