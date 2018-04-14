// dependencies
const common = require('./common.js')
// basic bot commands
const name = 'bot'
const desc = 'basic bot commands'
var bot = {
  ping (Command) {
    return 'pong'
  },
  echo (Command) {
    return Command.argument
  },
  flip (Command) {
    var flip = common.randInt(0, 1) ? 'heads' : 'tails'
    return flip
  }
}
var commands = {
  ping: bot.ping,
  echo: bot.echo,
  flip: bot.flip
}
module.exports = {bot, commands, name, desc}
