// dependencies
import { Common } from '../common'
const common = Common.commands
import { Module } from '../module'
import { Command } from '../../objects/command'
// basic bot commands
export const bot: Module = {
  name: 'bot',
  desc: 'basic bot commands',
  functions: {
    ping(command: Command): void {
      command.reply('pong')
    },
    echo(command: Command): void {
      command.reply(command.argument)
    },
    flip(command: Command): void {
      var heads
      var tails
      if (command.args.length === 2) {
        heads = command.args[0]
        tails = command.args[1]
      } else {
        heads = 'heads'
        tails = 'tails'
      }
      var flip = common['randInt'](0, 1) ? heads : tails
      command.reply(flip)
    },
    choose(command: Command): void {
      var n = command.args.length
      if (n >= 2) {
        command.reply(command.args[common['randInt'](0, n - 1)])
      } else {
        command.reply('Please provide at least 2 options.')
      }
    }
  },
  commands: {
    ping: { key: 'ping', desc: 'Echoes back "Pong!" as proof-of-life.' },
    echo: { key: 'echo', desc: 'Echoes back whatever text is sent. Cannot be used to trigger her commands.' },
    flip: { key: 'flip', desc: 'Flips a coin, or if exactly two space-delimited options are provided, chooses between them.' },
    choose: { key: 'choose', desc: 'Given a space-delimited list of at least two choices, picks one at random.' }
  }
}
