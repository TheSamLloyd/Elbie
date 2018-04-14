// dependencies
var campaigns = require('./Campaigns/campaigns.json')
const fs = require('fs')
const common = require('./common.js')
const Discord = require('discord.js')

// module information
const name = 'rpg'
const desc = 'functions to allow basic RPG commands'
function defRoll (Command) {
  var mod = parseInt(Command.argument)
  return common.randInt(1, 20) + (mod || 0)
}
function roll (Command) {
  var rolls = Command.argument.split(',')
  var results = {}
  rolls.forEach(function (roll, index) {
    var dielist = []
    var total = 0
    roll.split('+').forEach(function (die) {
      var k = die.split('d')
      if (k.length === 1) {
        dielist.push(parseInt(k[0]))
      }
      if (k.length === 2) {
        var lim = k[0] === '' ? 1 : parseInt(k[0])
        for (var i = 0; i < lim; i++) {
          dielist.push(common.randInt(1, parseInt(k[1])))
        }
      }
    })
    var tTotal = common.sum(dielist)
    var valid = !(isNaN(tTotal))
    results[index] = {roll: roll, dielist: dielist, total: total, valid: valid}
  })
  console.log(results)
  return results
}
function rollFormat (Command) {
  var output = roll(Command)
  var text = ''
  for (var i = 0; i < Object.keys(output).length; i++) {
    if (output[i].valid) {
      text += output[i].roll + ': ' + output[i].dielist + '=**' + output[i].total + '**\n'
    } else {
      text += output[i].roll + ': malformed roll'
    }
  }
  return text.trim()
}
function typed (arg) {
  if (isNaN(parseFloat(arg))) {
    return arg
  } else if (Math.floor(parseFloat(arg)) == parseFloat(arg)) {
    return parseInt(arg)
  } else return parseFloat(arg)
}
function campaignChannel (Command) {
  try {
    var cTitle = campaigns[Command.channel.guild_id][Command.channel.id]
  } catch (err) {
    console.log(err)
    var cTitle = false
  }
  return cTitle
}
function isDM (Command) {
  var dm = campaigns[Command.channel.guild_id][Command.channel.id].dm
  return (Command.auth.id == dm)
}
function caps (string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}
function idTest (element, arg) {
  arg = caps(arg)
  return (element.name === arg || (element.playerName === arg || element.nickname === arg))
}
function getPlayerByID (Command) {
  var players = campaignChannel(Command).characters
  var id
  console.log(players)
  Object.keys(players).forEach(function (element) {
    if (idTest(players[element], Command.argument)) {
      id = element
    }
  })
  return id
}
var listChar = function (Command) {
  var players = campaignChannel(Command).characters
  var array = ''
  Object.keys(players).forEach(function (element) {
    var char = players[element]
    array += char.name + ' (' + char.playerName + ')\n'
  })
  return array.trim()
}
function who (Command) {
  if (Command.argument !== '') {
    Command.auth.id = getPlayerByID(Command)
  }
  var char = Character.getChar(Command)
  var embed = new Discord.RichEmbed()
    .setColor('GREEN')
    .setAuthor(char.name + ' (' + char.playerName + ')')
    .addField('Class:', char.class, true)
    .addField('Race:', char.race, true)
    .addField('Level:', char.level, true)
    .addField('XP:', char.exp + '/' + (char.level + 6), true)
    .addField('HP:', char.HP + '/' + char.baseHP, true)
    .addField('Alignment:', char.alignment, false)
  Character.getStats(Command).forEach(function (stat) {
    embed.addField(stat + ':', char.skills[stat], true)
  })
  embed.addField('Description:', char.desc, false)
    .setFooter('| Elbeanor', 'https://instagram.fbed1-2.fna.fbcdn.net/t51.2885-15/e35/1168522_964193110314463_239442678_n.jpg')
  if (char.aviURL) {
    embed.setImage(char.aviURL)
  }
  return embed
}
function orDef (val, def) {
  return (val || def)
}
function cast (Command) {
  var castlist = {
    mark: ['exp', orDef(Command.args[0], 1), true],
    hp: ['HP', orDef(Command.args[0], 0), true]
  }
  Command.args = castlist[Command.command]
  if (Command.args[2]) {
    return Command.args[0] + ': ' + Character.modifyAttr(Command)
  } else {
    return Command.args[0] + ': ' + Character.setAttr(Command)
  }
}
function bind (Command) {
  if (!(Command.channel.id in campaigns)) {
    campaigns[Command.channel.id] = {
      dm: Command.auth.id,
      channel: Command.channel.id,
      shtname: Command.args[0],
      name: Command.args.slice(1).join(' ')
    }
    Character.save()
    return 'Please finish setup on the web interface.'
  } else {
    return 'Already defined a campaign for this channel.'
  }
}
// Character object designed to encapsulate Character functions
var Character = {
  getChar: function (Command) {
    return campaigns[Command.channel.guild_id][Command.channel.id].characters[Command.auth.id]
  },
  getStats: function (Command) {
    var char = Character.getChar(Command)
    var skills = Object.keys(char.skills)
    return skills
  },
  getSystem: function (Command) {
    return campaigns[Command.channel.guild_id][Command.channel.id].game
  },
  save: function (Command) {
    try {
      fs.writeFileSync('./Campaigns/campaigns.json',
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
    char[attr] = typed(value)
    if (Character.save(Command)) {
      return true
    } else return false
  },
  modifyAttr: function (Command) {
    var char = Character.getChar(Command)
    var attr = Command.args[0]
    var value = Command.args[1]
    char[attr] += typed(value)
    console.log(attr)
    if (attr == 'HP') {
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
  skillRoll: function (Command) {
    var system = gameList[Character.getSystem(Command)]
    var skill = system.skillAlias[Command.args[0]]
    var char = Character.getChar(Command)
    var mod = system.mod(char.skills[skill])
    console.log(mod, char.skills[skill], skill)
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

// object to turn game strings into game objects
var gameList = {
  'Dungeon World': DungeonWorld
}
module.exports = {campaigns, campaignChannel, who, Character, listChar, cast, bind}
