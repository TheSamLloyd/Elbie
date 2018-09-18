// dependencies
require('dotenv').config()
const Discord = require('discord.js')
const client = new Discord.Client()
const token = process.env.DISCORD_TOKEN
const modules = require('./bot_modules')
const axios = require('axios')
const prefix = '+'
const env = process.env.NODE_ENV || 'dev'

// adding commands
var commandList = {}
modules.forEach(module => {
  Object.assign(commandList, module.commands)
  console.log('Loaded commands for module ' + module['name'])
  console.log('>' + module['desc'])
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
        `query { 
          repository(owner:"TheSamLloyd", name:"Elbie"){
            releases(last:1){
              nodes{
                tag {
                  name
                }
              }
            }
          }
        }`
    }
  }).then((response) => {
    let version = response.data.data.repository.releases.nodes[0].tag.name
    console.log(version)
    client.user.setPresence({
      'status': 'online',
      'afk': false,
      'game': {
        name: env !== 'dev' ? `${version}` : `DEV -- ${version}`,
        type: 'PLAYING'
      }
    })
  }).catch(err => {
    console.log(err)
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
  console.log('Got an error, trying to reconnect...')
  client.login(token)
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
    Command.channel.send(errorHandler(err))
  }
}
// command execution
client.on('message', function (message) {
  if (isCommand(message)) {
    var content = message.content.slice(1).split(' ')
    var Command = {
      channel: clean(message.channel),
      auth: clean(message.author),
      member: message.member,
      command: content[0],
      argument: content.slice(1).join(' '),
      args: content.slice(1),
      server: message.guild
    }
    // commands
    if (!Object.keys(commandList).includes(Command.command)) {
      Command.channel.send('I couldn\'t understand that command.')
    } else {
      handler(Command)
    }
  }
})
