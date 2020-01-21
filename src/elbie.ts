// dependencies
require('dotenv').config()
import Discord from 'discord.js'
import { Command } from './objects/command'
const client = new Discord.Client()
const token: string | undefined = process.env.DISCORD_TOKEN
import { modules } from './bot_modules'
const prefix: string = '+'
const env: string | undefined = process.env.BUILD
const selfPackage = require('../package.json')

// adding commands
interface ICommandList {
  [cmd: string]: (command: Command) => any
}

const commandList: ICommandList = {}
modules.forEach(module => {
  Object.assign(commandList, module.commands)
  console.log('Loaded commands for module ' + module['name'])
  console.log('>' + module['desc'])
})

// helper functions
function isCommand(message: Discord.Message) {
  return (message.content[0] === prefix)
}
// login
client.login(token).then(
  () => {
    console.log('Discord connection ready')
  },
  err => {
    console.error(`Discord connection failed... \n${err}`)
    process.exit(400)
  }
)
// readying
client.on('ready', function () {
  var version = selfPackage.version
  var locale = null
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
    status: 'online',
    game: {
      name: locale,
      url: 'https://github.com/TheSamLloyd/Elbie'
    }
  } as Discord.PresenceData).catch((err: Error) => {
    console.error(err)
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
client.on('error', function (err: Error) {
  console.error(err)
  console.log('Got an error, trying to reconnect...')
  client.login(token)
})
//  for JS errors:
function errorHandler(err: Error) {
  console.error(err)
  return `I ran into an error of type ${err.name}: check console for details.`
}
//  command handling
function handler(cmd: Command) {
  if (cmd.command === '?') {
    var output: string[] = []
    Object.keys(commandList).forEach(command => {
      output.push(commandList[command].desc ? `${command} : ${commandList[command].desc}` : `${command}`)
    })
    cmd.reply(output.join('\n'))
  } else {
    try {
      commandList[cmd.command]['function'] ? commandList[cmd.command]['function'](Command) : commandList[cmd.command](Command)
    } catch (err) {
      cmd.reply(errorHandler(err))
    }
  }
}
// command execution
client.on('message', function (message) {
  if (isCommand(message)) {
    let command = new Command(message)
    // commands
    if (command.command === '?' || Object.keys(commandList).includes(command.command)) {
      console.log(`Command: ${command.auth['username']}: ${command.command} => ${command.argument} `)
      handler(command)
    } else {
      command.reply('I couldn\'t understand that command.')
    }
  }
})
