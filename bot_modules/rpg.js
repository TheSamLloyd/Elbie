// dependencies
const common = require('./common.js')
const Discord = require('discord.js')
const cInfo = require('./rpg/character.js')
const Character = cInfo.Character
var campaigns = cInfo.campaigns
const db = cInfo.db

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
    rolls.forEach(function (iroll, index) {
      var dielist = []
      iroll.split('+').forEach(function (die) {
        var k = die.split('d')
        if (k.length === 1) {
          dielist.push(parseInt(k[0]))
        }
        if (k.length === 2) {
          var lim = ((k[0] === '') ? 1 : parseInt(k[0]))
          for (var i = 0; i < lim; i++) {
            dielist.push(common.randInt(1, parseInt(k[1])))
          }
        }
      })
      var tTotal = common.sum(dielist)
      var valid = !(isNaN(tTotal))
      results[index] = {roll: iroll, dielist: dielist, total: tTotal, valid: valid}
    })
    console.log(results)
    return results
  },
  // terminal
  rollFormat (Command) {
    var output = rpg.roll(Command)
    var text = ''
    for (var i = 0; i < Object.keys(output).length; i++) {
      if (output[i].valid) {
        text += output[i].roll + ': ' + output[i].dielist + '=**' + output[i].total + '**\n'
      } else {
        text += output[i].roll + ': malformed roll'
      }
    }
    Command.channel.send(text.trim())
  },
  getCampaign (Command, cb) {
    db.CampaignObject.findOne({channel: Command.channel.id}, function (err, campaign) {
      if (err) return console.error(err)
      console.log(campaign)
      console.log(campaign.id)
      cb(campaign)
    })
  },
  isDM (Command) {
    var dm = rpg.getCampaign(Command).dm
    return (Command.auth.id === dm)
  },
  idTest (element, arg) {
    arg = common.caps(arg)
    return (element.name === arg || (element.playerName === arg || element.nickname === arg))
  },
  getPlayerByID (Command, cb) {
    db.CharacterObject.find({ campaign: rpg.getCampaign(Command).id }, function (err, characters) {
      if (err) console.error(err)
      db.userObject.populate(characters, { path: 'user', model: 'User' }, function (err, characters) {
        if (err) console.error(err)
        characters.findOne({$or: [{name: Command.argument}, {nickname: Command.argument}, {'user.name': Command.argument}]}, function (err, char) {
          if (err) console.error(err)
          cb(char)
        })
      })
    })
  },
  // terminal
  listChar (Command) {
    console.log('Listing...')
    db.CampaignObject.findOne({ channel: Command.channel.id }, function (err, campaign) {
      if (err) console.error(err)
      db.CharacterObject.find({campaign: campaign.id}, function (err, characters) {
        if (err) console.error(err)
        db.UserObject.populate(characters, {path: 'user', model: 'User'}, function (err, characters) {
          if (err) console.error(err)
          characters = characters.map((char) => ({name: char.name, user: char.user.name}))
          var out = ''
          characters.forEach((char) => {
            out += `- ${char.name} (${char.user})\n`
          })
          console.log(out)
          Command.channel.send(out.trim())
        })
      })
    })
  },
  // terminal
  who (Command) {
    if (Command.argument !== '') {
      Command.auth.id = rpg.getPlayerByID(Command)
    }
    Character.getChar(Command, function (char) {
      var embed = new Discord.RichEmbed()
        .setColor('GREEN')
        .setAuthor(char.name + ' (' + char.playerName + ')')
        .addField('Class:', common.caps(char.class), true)
        .addField('Race:', common.caps(char.race), true)
        .addField('Level:', char.level, true)
        .addField('XP:', char.exp + '/' + (char.level + 6), true)
        .addField('HP:', char.HP + '/' + char.baseHP, true)
        .addField('Alignment:', char.alignment, false)
      Character.getStats(Command).forEach(function (stat) {
        embed.addField(stat + ':', char.stats[stat], true)
      })
      embed.addField('Description:', char.desc, false)
        .setFooter('| Elbeanor', 'https://instagram.fbed1-2.fna.fbcdn.net/t51.2885-15/e35/1168522_964193110314463_239442678_n.jpg')
      if (char.aviURL) {
        embed.setImage(char.aviURL)
      }
      Command.channel.send(embed)
    })
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
      Command.channel.send('Please finish setup on the web interface.')
    } else {
      Command.channel.send('Already defined a campaign for this channel.')
    }
  },
  // terminal
  statRoll (Command) {
    let sRoll = Character.statRoll(Command)
    Command.argument = sRoll
    Command.channel.send(rpg.rollFormat(Command))
  }
}
const commands = {
  r: rpg.defRoll,
  bind: rpg.bind,
  who: rpg.who,
  listChar: rpg.listChar,
  roll: rpg.rollFormat,
  hp: rpg.cast,
  mark: rpg.cast,
  s: rpg.statRoll,
  levelup: Character.levelup
}
// object to turn game strings into game objects
module.exports = {rpg, commands, name, desc}
