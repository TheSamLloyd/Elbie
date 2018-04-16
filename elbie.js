// dependencies
require('dotenv').config()
const Discord = require('discord.js')
const client = new Discord.Client()
const token = process.env.DISCORD_TOKEN
const bot = require('./bot_modules/bot.js')
const rpg = require('./bot_modules/rpg.js')
const prefix = '+'

// adding commands
var modules = [bot, rpg]
var commandList = {}
modules.forEach(module => {
  Object.assign(commandList, module.commands)
  console.log('Loaded commands for module ' + module.name)
  console.log('>' + module.desc)
})
console.log(commandList)

// helper functions
function isCommand (message) {
  return (message.content[0] === prefix)
}
// login
client.login(token)
// readying
client.on('ready', function () {
  client.user.setPresence({
    'status': 'online',
    'afk': false,
    'game': {
      name: 'my code get upgraded',
      type: 'WATCHING'
    }
  })
  console.log('Ready!')
})

// keep-alive connection
client.on('disconnect', function () {
  client.login(token)
})
// error handling
// for discord errors:
client.on('error', function (err) {
  console.log(err)
  client.destroy()
})
//  for JS errors:
function errorHandler (err) {
  console.log(err)
  return 'I ran into an error of type ' + err.name + ': check console for details.'
}
//  command handling
function handler (Command) {
  var out
  try {
    out = commandList[Command.command](Command)
  } catch (err) {
    out = errorHandler(err)
  }
  return out
}
// command execution
client.on('message', function (message) {
  if (isCommand(message)) {
    var content = message.content.slice(1).split(' ')
    var Command = {
      channel: message.channel,
      auth: message.author,
      command: content[0],
      argument: content.slice(1).join(' '),
      args: content.slice(1)}
    console.log(Command)
    // commands
    if (Object.keys(commandList).indexOf(Command.command) === -1) {
      Command.channel.send('I couldn\'t understand that command.')
    } else {
      Command.channel.send(handler(Command))
    }
  }
})
