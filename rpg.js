const campaigns = require("./Campaigns/campaigns.json")
const Discord = require('discord.js');
function campaignChannel(Command){
	try{
		var cTitle=campaigns[Command.channel.id]["name"]
	}
	catch(err){
		console.log(err)
		var cTitle=false;
	}
	return cTitle;
}
function getChar(Command){
	return campaigns[Command.channel.id].characters[Command.auth.id]
}
function getStats(Command){
	var char = getChar(Command);
	var skills = Object.keys(char.skills);
	return skills;
}
function who(Command){
	var char = getChar(Command);
	var embed = new Discord.RichEmbed()
		.setColor("GREEN")
		.setAuthor(char.name+" ("+char.playerName+")")
		.addField("Class:",char.class, true)
		.addField("Race:",char.race, true)
		.addField("Level:",char.level, true)
		.addField("XP:",char.exp+"/"+(char.level+6), true)
		.addField("HP:",char.HP+"/"+char.baseHP, true)
		.addField("Alignment:",char.alignment,false);
	getStats(Command).forEach(function(stat){
		embed.addField(stat+":",char.skills[stat],true);
	})
	embed.addField("Description:",char.desc,false)
		.setFooter("| Elbeanor","https://instagram.fbed1-2.fna.fbcdn.net/t51.2885-15/e35/1168522_964193110314463_239442678_n.jpg");
	if (char.aviURL){
		embed.setImage(char.aviURL)
	}
	return embed
}
module.exports = {campaigns, campaignChannel, who}