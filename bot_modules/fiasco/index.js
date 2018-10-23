// dependencies
const common = require('../common')
const rpg = require('../rpg').rpg
// formatting
const name = 'fiasco'
const desc = 'module to allow for the ttrpg fiasco'
const fiasco = {
  state: null,
  numPlayers: 0,
  listener: null,
  players: [],
  start: (Command) => {
    fiasco.state = 'pregame'
    fiasco.listener = Command.channel.createMessageCollector(msg => msg[0] === '+')
    fiasco.numPlayers = parseInt(Command.argument)
    if (!(fiasco.numPlayers > 0)) return
    Command.argument = `${fiasco.numPlayers * 4}d6`
    const dielist = rpg.roll(Command)['0']['dielist']
    Command.channel.send(dielist.toString())
  },
  setPlayer: (msg) => {
    players[players.length] = {id: msg.author.id, name: msg.text, dielist:[]}
    msg.channel.send(`Set player ${players.length-1} to ${msg.author.name}`)
  }
}
const commands = {
  fiasco: fiasco.start,
  set: null
}
module.exports = {fiasco, name, desc, commands}
