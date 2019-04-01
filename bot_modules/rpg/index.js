// dependencies
const common = require('../common.js').common
const Discord = require('discord.js')
const cInfo = require('./character.js')
const Character = cInfo.Character
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
      iroll.split(/(\+|-)/).forEach(function (die) {
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
  advantage (Command) {
    if (Command.argument.indexOf(',') !== -1) {
      Command.channel.send('You can only do one roll with advantage.')
      return null
    } else {
      Command.argument = Command.argument + ',' + Command.argument
      var output = rpg.roll(Command)
      var text = ''
      if (output[0].valid) {
        var bool = output[0].total > output[1].total ? 0 : 1
        for (var i = 0; i <= 1; i++) {
          text += output[i].roll + ': ' + output[i].dielist + '=**' + output[i].total + '**\n'
        }
        if (Command.command === 'adv') {
          text += 'Result: **' + output[bool].total + '**'
        }
        if (Command.command === 'disadv' || Command.command === 'dadv') {
          text += 'Result: **' + output[1 - bool].total + '**'
        }
      }
      Command.channel.send(text)
    }
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
  getCharByPlayer (Command, cb) {
    var query = Command.argument !== '' ? {name: common.caps(Command.argument)} : {_id: Command.auth.id}
    db.UserObject.findOne(query, function (err, user) {
      if (err) console.error(err)
      if (!user) return cb(null)
      rpg.getCampaign(Command, function (campaign) {
        db.CharacterObject.findOne({ $and: [{ user: user.id }, { campaign: campaign.id }] }).populate('user').exec(function (err, char) {
          if (err) console.error(err)
          cb(char)
        })
      })
    })
  },
  getCharByName (Command, cb) {
    rpg.getCampaign(Command, campaign => {
      db.CharacterObject
        .findOne({$and: [{campaign: campaign.id}, {$or: [{name: common.caps(Command.argument)}, {nickname: common.caps(Command.argument)}]}]})
        .populate('user')
        .exec(function (err, char) {
          if (err) console.error(err)
          console.log(char)
          cb(char)
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
    rpg.getCharByPlayer(Command, function (char) {
      rpg.getCharByName(Command, function (char2) {
        char = char || (char2 || null)
        if (!char) return null
        var embed = new Discord.RichEmbed()
          .setColor('GREEN')
          .setAuthor(char.name + ' (' + char.user.name + ')')
          .addField('Class:', common.caps(char.class || 'None'), true)
          .addField('Race:', common.caps(char.race || 'None'), true)
          .addField('Level:', char.level, true)
          .addField('XP:', char.exp + '/' + (char.level + 6), true)
          .addField('HP:', char.HP + '/' + char.maxHP, true)
          .addField('Alignment:', (char.alignment || 'None'), false)
        Character.getStats(Command, (stats) => {
          stats.forEach(stat => {
            embed.addField(stat + ':', stats[stat], true)
          })
        })
        embed.addField('Description:', (char.desc || 'None'), false)
          .setFooter('| Elbeanor', 'https://instagram.fbed1-2.fna.fbcdn.net/t51.2885-15/e35/1168522_964193110314463_239442678_n.jpg')
        if (char.aviURL) {
          embed.setImage(char.aviURL)
        }
        Command.channel.send(embed)
      })
    })
  },
  cast (Command, cb) {
    var castlist = {
      mark: ['exp', common.orDef(Command.args[0], 1), true],
      hp: ['HP', common.orDef(Command.args[0], 0), true]
    }
    Command.args = castlist[Command.command]
    if (Command.args[2]) {
      Character.modifyAttr(Command, function (attr) {
        Command.channel.send(`${Command.args[0]}: ${attr}`)
      })
    } else {
      Character.setAttr(Command, function (attr) {
        Command.channel.send(`${Command.args[0]}: ${attr}`)
      })
    }
  },
  bind (Command) {
    rpg.getCampaign(Command, function (campaign) {
      if (!campaign) {
        const newCampaign = new db.CampaignObject({
          dm: Command.auth.id,
          channel: Command.channel.id,
          shtname: Command.args[0],
          name: Command.args.slice(1).join(' ')
        })
        newCampaign.save(function (err, campaign) {
          if (err) console.error(err)
          else {
            Command.channel.send(`Successfully created new campaign: ${campaign.name}
          Please finish setup on the web interface [[link forthcoming]]`)
          }
        })
      } else {
        Command.channel.send('Already defined a campaign for this channel.')
      }
    })
  },
  statRoll (Command) {
    Character.statRoll(Command, rpg.rollFormat)
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
  levelup: Character.levelup,
  theme: Character.theme,
  adv: rpg.advantage,
  dadv: rpg.advantage,
  disadv: rpg.advantage
}
// object to turn game strings into game objects
module.exports = {rpg, commands, name, desc}
