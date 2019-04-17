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
    var heads
    var tails
    if (Command.args.length === 2) {
      heads = Command.args[0]
      tails = Command.args[1]
    } else {
      heads = 'heads'
      tails = 'tails'
    }
    var flip = common.randInt(0, 1) ? heads : tails
    Command.channel.send(flip)
  },
  choose (Command) {
    var n = Command.args.length
    if (n >= 2) {
      Command.channel.send(Command.args[common.randInt(0, n - 1)])
    }
    else {
      Command.channel.send('Please provide at least 2 options.')
    }
  }
}
var commands = {
  ping: bot.ping,
  echo: bot.echo,
  flip: bot.flip
}
module.exports = { bot, commands, name, desc }
