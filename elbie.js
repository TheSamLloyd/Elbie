//dependencies
const requests = require('requests');
const Discord = require('discord.js');
const client = new Discord.client();

//readying
client.on("ready", function(){
	console.log("Ready!")
})