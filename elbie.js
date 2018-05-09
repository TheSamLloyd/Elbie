// dependencies
require('dotenv').config()
const Discord = require('discord.js')
const client = new Discord.Client()
const token = process.env.DISCORD_TOKEN
const bot = require('./bot_modules/bot.js')
const rpg = require('./bot_modules/rpg.js')
const axios = require('axios')
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
function clean (str) {
  str.id = str.id.replace(/\W/g, '')
  return str
}

// login
client.login(token)
// readying
client.on('ready', function () {
  axios({
    method: 'post',
    url: 'https://api.github.com/graphql',
    auth: {
      user: 'TheSamLloyd',
      password: process.env.GITHUB_TOKEN
    },
    data: {
      query:
        `query Release {
          repository(owner: "TheSamLloyd", name: "Elbie") {
            release(tagName: "main") {
              name
            }
          }
        }`
    }
  }).then((response) => {
    console.log(response.data.data.repository.release.name)
    client.user.setPresence({
      'status': 'online',
      'afk': false,
      'game': {
        name: response.data.data.repository.release.name,
        type: 'PLAYING'
      }
    })
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
  try {
    commandList[Command.command](Command)
  } catch (err) {
    Command.send(errorHandler(err))
  }
}
// command execution
client.on('message', function (message) {
  if (isCommand(message)) {
    var content = message.content.slice(1).split(' ')
    var Command = {
      channel: clean(message.channel),
      auth: clean(message.author),
      command: content[0],
      argument: content.slice(1).join(' '),
      args: content.slice(1)
    }
    // commands
    if (!Object.keys(commandList).includes(Command.command)) {
      Command.channel.send('I couldn\'t understand that command.')
    } else {
      handler(Command)
    }
  }
})
