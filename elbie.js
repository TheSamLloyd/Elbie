// dependencies
require('dotenv').config()
const Discord = require('discord.js')
const client = new Discord.Client()
const token = process.env.DISCORD_TOKEN
const modules = require('./bot_modules')
const prefix = '+'
const env = process.env.BUILD
const selfPackage = require('./package.json')

// adding commands
var commandList = {}
modules.forEach(module => {
  Object.assign(commandList, module.commands)
  console.log('Loaded commands for module ' + module['name'])
  console.log('>' + module['desc'])
})

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
  let version = selfPackage.version
  let locale = null
  switch (env) {
    case 'production':
      locale = `${version}`
      break
    case 'development':
      locale = `DEV -- ${version}`
      break
    case 'canary':
      locale = `CANARY`
      break
  }
  console.log(version)
  client.user.setPresence({
    'status': 'online',
    'afk': false,
    'game': {
      name: locale,
      type: 'PLAYING'
    }
  }).catch(err => {
    console.log(err)
  })
  console.log('Ready!')
})

// keep-alive connection
client.on('disconnect', function () {
  console.log('Disconnected, attempting to reconnect...')
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
  return `I ran into an error of type ${err.name}: check console for details.`
}
//  command handling
function handler (Command) {
  if (Command.command === '?') {
    var output = []
    Object.keys(commandList).forEach(command => {
      output.push(commandList[command].desc ? `${command} : ${commandList[command].desc}` : `${command}`)
    })
    Command.channel.send(output.join('\n'))
  } else {
    try {
      commandList[Command.command]['function'] ? commandList[Command.command]['function'](Command) : commandList[Command.command](Command)
    } catch (err) {
      Command.channel.send(errorHandler(err))
    }
  }
}
// command execution
client.on('message', function (message) {
  if (isCommand(message)) {
    var content = message.content.slice(1).split(' ').filter(element => (element || element === 0))
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
    if (Command.command === '?' || Object.keys(commandList).includes(Command.command)) {
      console.log(Command)
      handler(Command)
    } else {
      Command.channel.send('I couldn\'t understand that command.')
    }
  }
})
