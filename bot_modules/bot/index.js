// dependencies
const common = require('../common.js').common
// basic bot commands
const name = 'bot'
const desc = 'basic bot commands'
var bot = {
  ping (Command) {
    Command.channel.send('pong')
  },
  echo (Command) {
    Command.channel.send(Command.argument)
  },
  flip (Command) {
    var flip = common.randInt(0, 1) ? 'heads' : 'tails'
    Command.channel.send(flip)
  }
}
var commands = {
  ping: bot.ping,
  echo: bot.echo,
  flip: bot.flip
}
module.exports = {bot, commands, name, desc}
