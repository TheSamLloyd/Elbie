//dependencies
const requests = require('requests');
const Discord = require('discord.js');
const client = new Discord.Client();
const token = "MjU1MzkwMzk0MjE5NjI2NDk2.CyfptA.3iYEnqOFkLtl5Vasj3wgrIKSXgk";

//readying
client.on("ready", function(){
	console.log("Ready!")

})
//helper functions
function isCommand(message){
	if (message.content[0]=="+"){
		return true;
	}
	else return false;
}
function getID(message){
	message.author.id
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
function roll(str){
	var rolls=str.split(",");
	rolls.forEach(function(roll){
		var total=0;
		roll.split("+").forEach(function(dice){
			console.log(dice)
		})
	})
}
//error handling
client.on("error", function(err){
	console.log(err)
	console.log("you did something so bad that it killed me.")
	client.destroy()
})
function errorHandler(err){
	console.log(err.name)
	console.log(err.message)
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
commandList={
	ping:ping,
	echo:echo,
	flip:flip,
	r:defRoll,
	help:comList
};
function handler(Command){
	try{
		var out = commandList[Command.command](Command)
	}
	catch(err){
		errorHandler(err);
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
		argument : content.split(" ").slice(1).join(" ")};
		console.log(Command)
		//commands
		Command.channel.send(handler(Command))
		// 	case "roll":
		// 		outcome = roll(argument);
		// 		break;
		// 	case "r":
		// 		outcome = roll("1d20");
		// 		break;
		// 	default:
		// 		break;
		// }
	}
})

//login
client.login(token)