// dependencies
var campaigns = require('./rpg/campaigns.json')
const common = require('./common.js')
const Discord = require('discord.js')
const Character = require('./rpg/character.js')

// module information
const name = 'rpg'
const desc = 'functions to allow basic RPG commands'
const rpg = {
  defRoll (Command) {
    var mod = parseInt(Command.argument)
    return common.randInt(1, 20) + (mod || 0)
  },
  roll (Command) {
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
  },
  rollFormat (Command) {
    var output = this.roll(Command)
    var text = ''
    for (var i = 0; i < Object.keys(output).length; i++) {
      if (output[i].valid) {
        text += output[i].roll + ': ' + output[i].dielist + '=**' + output[i].total + '**\n'
      } else {
        text += output[i].roll + ': malformed roll'
      }
    }
    return text.trim()
  },
  campaignChannel (Command) {
    var cTitle
    try {
      cTitle = campaigns[Command.channel.guild_id][Command.channel.id]
    } catch (err) {
      console.log(err)
      cTitle = false
    }
    return cTitle
  },
  isDM (Command) {
    var dm = campaigns[Command.channel.guild_id][Command.channel.id].dm
    return (Command.auth.id === dm)
  },
  idTest (element, arg) {
    arg = common.caps(arg)
    return (element.name === arg || (element.playerName === arg || element.nickname === arg))
  },
  getPlayerByID (Command) {
    var players = this.campaignChannel(Command).characters
    var id
    console.log(players)
    Object.keys(players).forEach(function (element) {
      if (this.idTest(players[element], Command.argument)) {
        id = element
      }
    })
    return id
  },
  listChar (Command) {
    var players = this.campaignChannel(Command).characters
    var array = ''
    Object.keys(players).forEach(function (element) {
      var char = players[element]
      array += char.name + ' (' + char.playerName + ')\n'
    })
    return array.trim()
  },
  who (Command) {
    if (Command.argument !== '') {
      Command.auth.id = this.getPlayerByID(Command)
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
  },
  cast (Command) {
    var castlist = {
      mark: ['exp', common.orDef(Command.args[0], 1), true],
      hp: ['HP', common.orDef(Command.args[0], 0), true]
    }
    Command.args = castlist[Command.command]
    if (Command.args[2]) {
      return Command.args[0] + ': ' + Character.modifyAttr(Command)
    } else {
      return Command.args[0] + ': ' + Character.setAttr(Command)
    }
  },
  bind (Command) {
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
}
const commands = {
  r: rpg.defRoll,
  bind: rpg.bind,
  who: rpg.who,
  listChar: rpg.listChar,
  roll: rpg.rollFormat,
  hp: rpg.cast,
  exp: rpg.cast
}
// object to turn game strings into game objects
module.exports = {rpg, commands, name, desc}
