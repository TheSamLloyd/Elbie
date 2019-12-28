// dependencies
import { Common } from '../common'
const common = Common.commands
import { Module } from '../module'
// basic bot commands
export const bot = new Module({
  name: 'bot',
  desc: 'basic bot commands',
  functions: {
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
      var flip = common['randInt'](0, 1) ? heads : tails
      Command.channel.send(flip)
    },
    choose (Command) {
      var n = Command.args.length
      if (n >= 2) {
        Command.channel.send(Command.args[common['randInt'](0, n - 1)])
      } else {
        Command.channel.send('Please provide at least 2 options.')
      }
    }
  },
  commands: {
    ping: { function: this.functions.ping, desc: 'Echoes back "Pong!" as proof-of-life.' },
    echo: { function: this.functions.echo, desc: 'Echoes back whatever text is sent. Cannot be used to trigger her commands.' },
    flip: { function: this.functions.flip, desc: 'Flips a coin, or if exactly two space-delimited options are provided, chooses between them.' },
    choose: { function: this.functions.choose, desc: 'Given a space-delimited list of at least two choices, picks one at random.' }
  }
})
