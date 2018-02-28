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
	return (Command.auth.id==dm);
}
function caps(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
function idTest(element,arg){
	arg = caps(arg);
	return (element.name==arg||(element.playerName==arg||element.nickname==arg));
}
function getPlayerByID(Command){
	var players = campaignChannel(Command).characters;
	console.log(players);
	Object.keys(players).forEach(function(element){
		if (idTest(players[element],Command.argument)){
			id = element;
	}});
	return id;
}
var listChar = function(Command){
	var players = campaignChannel(Command).characters;
	var array="";
	Object.keys(players).forEach(function(element){
		var char = players[element]
		array+=char.name+" ("+char.playerName+")\n"
	})
	return array.trim();
}
function who(Command){
	if (Command.argument!=""){
		Command.auth.id = getPlayerByID(Command)}
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
function orDef(val,def){
	return (val||def)
}
function cast(Command){
	var castlist={
		mark : ["exp",orDef(Command.args[0],1),true],
		hp : ["HP",orDef(Command.args[0],0),true]
	};
	Command.args=castlist[Command.command];
	if (Command.args[2]){
		return Command.args[0]+": "+Character.modifyAttr(Command);
	}
	else{
		return Command.args[0]+": "+Character.setAttr(Command);
	}

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
		console.log(mod,char.skills[skill],skill)
		var roll = system.defRoll+"+"+mod;
		console.log(roll);
		return roll;
	},
	levelup : function(Command){
		var char = Character.getChar(Command);
		var system=gameList[Character.getSystem(Command)];
		var canLevel = system.levelup(char);
		if (canLevel){
			Command.args[0]="level";
			Command.args[1]=1;
			var success = Character.modifyAttr(Command);
			if (success) return "Leveled up to "+success;
			else return success;
		}
		else return "Could not level up. Check EXP."
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
		if (1<=score&&score<=3) val=-3;
		else if (4<=score&&score<=5) val=-2;
		else if (6<=score&&score<=8) val=-1;
		else if (9<=score&&score<=12) val=0;
		else if (13<=score&&score<=15) val=1;
		else if (16<=score&&score<=17) val=2;
		else if (score==18) val=3;
		else val=0;
		return val;
	}
}
//object to turn game strings into game objects
var gameList = {
	"Dungeon World" :DungeonWorld
};
module.exports = {campaigns, campaignChannel, who, Character, listChar, cast};