var campaigns = require("./Campaigns/campaigns.json");
const fs = require("fs");
const Discord = require('discord.js');
function typed(arg){
	if (isNaN(parseFloat(arg))){
		return arg;
	}
	else if (Math.floor(parseFloat(arg))==parseFloat(arg)){
		return parseInt(arg);
	}
	else return parseFloat(arg);
}
function campaignChannel(Command){
	try{
		var cTitle=campaigns[Command.channel.id]
	}
	catch(err){
		console.log(err)
		var cTitle=false;
	}
	return cTitle;
}
function isDM(Command){
	var dm = campaigns[Command.channel.id].dm;
	return (Command.auth.id==dm)
}
function who(Command){
	if (isDM(Command)){
		Command.auth.id = (Command.args[0]||Command.auth.id);
	}
	var char = Character.getChar(Command);
	var embed = new Discord.RichEmbed()
		.setColor("GREEN")
		.setAuthor(char.name+" ("+char.playerName+")")
		.addField("Class:",char.class, true)
		.addField("Race:",char.race, true)
		.addField("Level:",char.level, true)
		.addField("XP:",char.exp+"/"+(char.level+6), true)
		.addField("HP:",char.HP+"/"+char.baseHP, true)
		.addField("Alignment:",char.alignment,false);
	Character.getStats(Command).forEach(function(stat){
		embed.addField(stat+":",char.skills[stat],true);
	})
	embed.addField("Description:",char.desc,false)
		.setFooter("| Elbeanor","https://instagram.fbed1-2.fna.fbcdn.net/t51.2885-15/e35/1168522_964193110314463_239442678_n.jpg");
	if (char.aviURL){
		embed.setImage(char.aviURL)
	}
	return embed
}
//Character object designed to encapsulate Character functions
var Character={
	getChar : function(Command){
		return campaigns[Command.channel.id].characters[Command.auth.id];
	},
	getStats : function(Command){
		var char = Character.getChar(Command);
		var skills = Object.keys(char.skills);
		return skills;
	},
	getSystem : function(Command){
		return campaigns[Command.channel.id].game;
	},
	save : function(Command){
		try{fs.writeFileSync("./Campaigns/campaigns.json",
			JSON.stringify(campaigns),
			"utf8")
			return true;
		}
		catch(err){
			console.log(err);
			return false;
		}

	},
	setAttr : function(Command){
		var char = Character.getChar(Command);
		var attr = Command.args[0];
		var value = Command.args[1];
		char[attr] = typed(value);
		if(Character.save(Command)){
			return true;}
		else return false;
	},
	modifyAttr : function(Command){
		var char = Character.getChar(Command);
		var attr = Command.args[0];
		var value = Command.args[1];
		char[attr] += typed(value);
		console.log(attr)
		if (attr=="HP"){
			console.log("checking HP")
			char[attr] = Math.min(char.baseHP,Math.max(0,char.HP));
		}
		if(Character.save(Command)){
			return char[attr];}
		else return false;
	},
	getAttr : function(Command){
		var char = Character.getChar(Command);
		var attr = Command.args[0]
		try{
			if (char[attr]!=undefined) return char[attr];
			else return "Could not fetch attribute "+attr;
		}
		catch(err){
			console.log(err);
			return "Could not fetch attribute "+attr;
		}
	},
	skillRoll : function(Command){
		var system = gameList[Character.getSystem(Command)];
		var skill = system.skillAlias[Command.args[0]];
		var char = Character.getChar(Command);
		var mod = system.mod(char.skills[skill]);
		var roll = system.defRoll+"+"+mod;
		console.log(roll);
		return roll;
	}
}
var DungeonWorld = {
	defRoll : "2d6",
	skillAlias : {
		"str" : "Strength",
		"con" : "Constitution",
		"dex" : "Dexterity",
		"int" : "Intelligence",
		"wis" : "Wisdom",
		"cha" : "Charisma"
	},
	levelup : function(character){
		if (character.exp>=character.level+6){
			return true;
		}
		else return false;
	},
	mod : function(score){
		if (1<=score<=3) val=-3;
		else if (4<=score<=5) val=-2;
		else if (6<=score<=8) val=-1;
		else if (9<=score<=12) val=0;
		else if (13<=score<=15) val=1;
		else if (16<=score<=17) val=2;
		else if (score==18) val=3;
		else val=0;
		return val;
	}
}
//object to turn game strings into game objects
var gameList = {
	"Dungeon World" :DungeonWorld
};
module.exports = {campaigns, campaignChannel, who, Character};