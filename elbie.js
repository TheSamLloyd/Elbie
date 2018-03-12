//dependencies
require("dotenv").config();
const fs = require('fs');
const Discord = require('discord.js');
const rpg = require('./rpg.js');
const client = new Discord.Client();
const token = process.env.DISCORD_TOKEN;

//readying
client.on("ready", function(){
	client.user.setPresence({
		"status":"online",
		"afk":false,
		"game":{
			name:"Pilgrims of Her Blue Flame",
			type:"WATCHING"
		}
	})
	console.log("Ready!");
})
//helper functions
function isCommand(message){
	if (message.content[0]=="+"){
		return true;
	}
	else return false;
}
function randInt(a, b){
	if (b){
		var out = Math.floor(Math.random()*(b-a+1))+a;
	}
	else{
		var out = Math.floor(Math.random()*(a+1));
	}
	return out;
}
function sum(Array){
	var total=0;
	for (var i=0;i<Array.length;i++){
		total+=parseInt(Array[i]);
	}
	return total;
}
function rollFormat(Command){
	output = roll(Command);
	text = "";
	for (var i = 0;i<Object.keys(output).length;i++){
		if (output[i].valid){
			text+=output[i].roll+": "+output[i].dielist+"=**"+output[i].total+"**\n"
		}
		else{
			text+=output[i].roll+": malformed roll"
		}
	}
	return text.trim();
}
//error handling
client.on("error", function(err){
	console.log(err)
	console.log("you did something so bad that it killed me.")
	client.destroy()
})
function errorHandler(err){
	console.log(err)
	return "I ran into an error of type "+err.name+": check console for details."
}
//command handling
function comList(Command){
	var resp = "";
	Object.keys(commandList).join("\n");
	return resp
}
function ping(Command){
	return "pong"
}
function echo(Command){
	return Command.argument;
}
function flip(Command){
	if (randInt(0,1)==0) return "heads";
	else return "tails";
}
function defRoll(Command){
	var mod = parseInt(Command.argument);
	return randInt(1,20)+(mod||0)
}
function roll(Command){
	var rolls = Command.argument.split(",");
	var results={}
	rolls.forEach(function(roll, index){
		var dielist=[];
		var total=0;
		roll.split("+").forEach(function(die){
			var k = die.split("d");
			if (k.length==1){
				dielist.push(parseInt(k[0]));
			}
			if (k.length==2){
				var lim = k[0]=="" ? 1 : parseInt(k[0])
				for (var i=0;i<lim;i++){
					dielist.push(randInt(1,parseInt(k[1])));
				}
			}
		})
		var total = sum(dielist)
		var valid = !(isNaN(total));
		results[index]={roll:roll,dielist:dielist,total:total, valid:valid}
	})
	console.log(results)
	return results;
}
function perish(Command){
	if (Command.auth.id=="246462201148342272"){
		Command.channel.send(":-(")
		client.destroy();
		console.log("process ended manually")
		process.exit();
		return false;
	}
	else{
		Command.channel.send("hewwo?")
		return false;
	}
}
function skillRoll(Command){
	Command.argument=rpg.Character.skillRoll(Command);
	return rollFormat(Command);
}
commandList={
	ping:ping,
	echo:echo,
	flip:flip,
	r:defRoll,
	help:comList,
	roll:rollFormat,
	perish:perish,
	cTest:rpg.campaignChannel,
	who:rpg.who,
	system:rpg.Character.getSystem,
	attr:rpg.Character.setAttr,
	mod:rpg.Character.modifyAttr,
	mark:rpg.cast,
	hp:rpg.cast,
	get:rpg.Character.getAttr,
	help:help,
	s:skillRoll,
	listChar:rpg.listChar,
	levelup:rpg.Character.levelup,
	bind:rpg.bind
};
function help(Command){
	return Object.keys(commandList);
}
function handler(Command){
	try{
		var out = commandList[Command.command](Command)
	}
	catch(err){
		errorHandler(err);
		var out = "Ran into an error."
	}
	finally{
		return out;
	}
}
//command execution
client.on("message",function(message){
	if (isCommand(message)){
		var content = message.content.slice(1);
		var Command = {
		channel : message.channel,
		auth : message.author,
		command : content.split(" ")[0],
		argument : content.split(" ").slice(1).join(" "),
		args : content.split(" ").slice(1)}
		console.log(Command)
		//commands
		Command.channel.send(handler(Command))
	}
})
//login
client.login(token)