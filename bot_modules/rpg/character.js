// dependencies
const fs = require('fs')
var campaigns = require('./campaigns.json')
const common = require('../common.js')
const gameList = {
  'Dungeon World': require('./dungeon-world.js')
}
// Character object designed to encapsulate Character functions
var Character = {
  getChar: function (Command) {
    return campaigns[Command.channel.guild.id][Command.channel.id].characters[Command.auth.id]
  },
  getStats: function (Command) {
    var char = Character.getChar(Command)
    var stats = Object.keys(char.stats)
    return stats
  },
  getSystem: function (Command) {
    return campaigns[Command.channel.guild.id][Command.channel.id].game
  },
  save: function (Command) {
    try {
      fs.writeFileSync('./campaigns.json',
        JSON.stringify(campaigns),
        'utf8')
      return true
    } catch (err) {
      console.log(err)
      return false
    }
  },
  setAttr: function (Command) {
    var char = Character.getChar(Command)
    var attr = Command.args[0]
    var value = Command.args.slice(1).join(' ')
    char[attr] = common.typed(value)
    if (Character.save(Command)) {
      return true
    } else return false
  },
  modifyAttr: function (Command) {
    var char = Character.getChar(Command)
    var attr = Command.args[0]
    var value = Command.args[1]
    char[attr] += common.typed(value)
    console.log(attr)
    if (attr === 'HP') {
      console.log('checking HP')
      char[attr] = Math.min(char.baseHP, Math.max(0, char.HP))
    }
    if (Character.save(Command)) {
      return char[attr]
    } else return false
  },
  getAttr: function (Command) {
    var char = Character.getChar(Command)
    var attr = Command.args[0]
    try {
      if (char[attr] != undefined) return char[attr]
      else return 'Could not fetch attribute ' + attr
    } catch (err) {
      console.log(err)
      return 'Could not fetch attribute ' + attr
    }
  },
  statRoll: function (Command) {
    var system = gameList[Character.getSystem(Command)]
    var stat = system.statAlias[Command.args[0]]
    var char = Character.getChar(Command)
    var mod = system.mod(char.stats[stat])
    console.log(mod, char.stats[stat], stat)
    var roll = system.defRoll + '+' + mod
    console.log(roll)
    return roll
  },
  levelup: function (Command) {
    var char = Character.getChar(Command)
    var system = gameList[Character.getSystem(Command)]
    var canLevel = system.levelup(char)
    if (canLevel) {
      Command.args[0] = 'level'
      Command.args[1] = 1
      var success = Character.modifyAttr(Command)
      if (success) return 'Leveled up to ' + success
      else return success
    } else return 'Could not level up. Check EXP.'
  }
}
module.exports = {Character, gameList, campaigns}
