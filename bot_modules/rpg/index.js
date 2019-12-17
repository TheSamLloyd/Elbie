// dependencies
const common = require('../common.js').common
const Discord = require('discord.js')
const cInfo = require('./character.js')
const Character = cInfo.Character
const db = cInfo.db
const gameList = cInfo.gameList

// module information
const name = 'rpg'
const desc = 'functions to allow basic RPG commands'
const rpg = {
  defRoll (Command) {
    var mod = parseInt(Command.argument)
    var defroll = '2d6'
    rpg.getSystem(Command, campaign => {
      if (campaign != null) {
        defroll = gameList[campaign.system.name].defRoll
      }
      Command.argument = `${defroll}+${(mod || 0)}`
      rpg.rollFormat(Command)
    })
    return common.randInt(1, 6) + common.randInt(1, 6) + (mod || 0)
  },
  roll (Command) {
    var rolls = Command.argument.split(',')
    var results = {}
    rolls.forEach(function (iroll, index) {
      var dielist = []
      iroll = iroll.replace('-', '+-').replace('++', '+')
      iroll.split('+').forEach(function (die) {
        var k = die.split('d')
        if (k.length === 1) {
          if (!isNaN(parseInt(k[0]))) {
            dielist.push(parseInt(k[0]))
          }
        } else if (k.length === 2) {
          var lim = ((k[0] === '') ? 1 : parseInt(k[0]))
          for (var i = 0; i < lim; i++) {
            dielist.push(common.randInt(1, parseInt(k[1])))
          }
        } else {
          console.log('Empty or other weird length, disregarding...')
        }
      })
      var tTotal = common.sum(dielist)
      var valid = !(isNaN(tTotal))
      results[index] = { roll: iroll, dielist: dielist, total: tTotal, valid: valid }
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
    try {
      db.Campaign.Object.findOne().byCommand(Command).exec(function (err, campaign) {
        console.log(campaign)
        if (err) return console.log(err)
        campaign.populate('system', (err, res) => {
          if (err) return console.log(err)
          cb(res)
        })
      })
    } catch (exception) {
      console.log(exception)
      console.log('No campaign could be retrieved')
      cb(null)
    }
  },
  isDM (Command) {
    Character.getActiveCampaign(Command, function (err, campaign) {
      if (err) console.log(err)
      return (campaign.dm === Command.auth.id)
    })
  },
  getCharByPlayer (Command, cb) {
    var query = Command.argument !== '' ? { name: common.caps(Command.argument) } : { id: Command.auth.id }
    console.log(query)
    db.User.Object.findOne(query, function (err, user) {
      if (err) console.error(err)
      if (!user) return cb(null)
      console.log(user)
      Character.getChar(Command).populate('user').exec(function (err, char) {
        if (err) console.log(err)
        cb(char)
      })
    })
  },
  getCharByName (Command, cb) {
    rpg.getCampaign(Command, campaign => {
      db.Character.Object.findOne().byCampaignAndName(campaign.id, common.caps(Command.argument))
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
    rpg.getCampaign(Command, campaign => {
      db.Character.Object.find({ campaign: campaign.id }, function (err, characters) {
        if (err) console.error(err)
        db.User.Object.populate(characters, { path: 'user', model: 'User' }, function (err, characters) {
          if (err) console.error(err)
          characters = characters.map((char) => ({ name: char.name, user: char.user.name }))
          var out = ''
          characters.forEach((char) => {
            out += `• ${char.name} (${char.user})\n`
          })
          console.log(out)
          Command.channel.send(out.trim())
        })
      })
    })
  },
  // terminal
  who (Command) {
    if (Command.argument === '') {
      var getter
      getter = Character.getChar
    } else {
      getter = Character.getCharByAnyName
    }
    getter(Command, char => {
      if (char) {
        var embed = new Discord.RichEmbed()
          .setColor('GREEN')
          .setAuthor(char.name + ' (' + char.user.name + ')')
          .addField('Class:', common.caps(char.attributes.class || 'None'), true)
          .addField('Race:', common.caps(char.attributes.race || 'None'), true)
          .addField('Level:', char.level, true)
          .addField('XP:', char.exp + '/' + (char.level + 6), true)
          .addField('HP:', char.HP.current + '/' + char.HP.maxHP, true)
          .addField('Alignment:', (char.attributes.alignment || 'None'), false)
        for (var [key, value] of char.stats) {
          embed.addField(key + ':', value, true)
        }
        embed.addField('Description:', (char.desc || 'None'), false)
          .setFooter('Elbeanor')
        if (char.aviURL) {
          embed.setImage(char.aviURL)
        }
        try {
          Command.channel.send(embed)
        } catch (err) {
          Command.channel.send('Could not send rich embed -- may not have permission in this channel or server.')
        }
      } else {
        Command.channel.send(`Couldn't find a character in the active campaign scope with name, nickname, or user's name "${Command.argument}".`)
      }
    })
  },
  cast (Command) {
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
  },
  bladesRoll (Command) {
    var n = parseInt(Command.argument)
    var out
    var result
    var critical = 0
    var outcome
    if (n <= 0) {
      var dice1 = common.randInt(1, 6)
      var dice2 = common.randInt(1, 6)
      result = Math.min(dice1, dice2)
      out = `${n}d6: [${dice1}, ${dice2}]: ${result}`
    } else if (n > 0) {
      var dice = []
      for (var i = 0; i < n; i++) {
        dice.push(common.randInt(1, 6))
      }
      result = Math.max(...dice)
      dice.forEach(die => {
        if (die === 6) critical++
      })
      out = `${n}d6: ${dice}: ${result}`
    }
    critical = (critical >= 2)
    if (critical) outcome = 'Critical success'
    else if (result === 6) outcome = 'Full success'
    else if (result >= 4) outcome = 'Partial success'
    else if (result >= 1) outcome = 'Bad outcome'
    else if (isNaN(n)) {
      Command.channel.send('Malformed roll.')
      return null
    }
    out = `${out} - ${outcome}`
    Command.channel.send(out)
    return null
  }
}
const commands = {
  r: { function: rpg.defRoll, desc: 'Rolls the default roll for the system defined in the channel, or if no system is defined, rolls 2d6. Add an integer argument to modify the roll.' },
  bind: { function: rpg.bind, desc: 'Binds the channel to a new campaign. The DM should use this function. Syntax is +bind shortname Long Name of Campaign.' },
  who: { function: rpg.who, desc: 'Displays information about the users\'s character, or if another user is specified by name or character name, that user\' character.' },
  listChar: { function: rpg.listChar, desc: 'Lists every character and their associated user in the channel\'s associated campaign.' },
  roll: { function: rpg.rollFormat, desc: 'Rolls a number of comma-separated rolls in xdy+k, xdy-3 format.' },
  hp: { function: rpg.cast, desc: 'With no arguments, displays your current HP. With an integer argument, adjusts HP by that much, limited to the range between max HP and 0.' },
  mark: { function: rpg.cast, desc: 'With no arguments, increases your experience by 1 and displays the new value. With an integer argument, adjusts experience by that much.' },
  s: { function: rpg.statRoll, desc: 'Given a stat abbreviation ("str", "frk"), rolls the default roll for the system and adds your character\'s modifier to it.' },
  levelup: { function: Character.levelup, desc: 'If possible, levels up your character and displays your new level. Makes no further stat changes.' },
  theme: { function: Character.theme, desc: 'If defined (and the audio module is loaded), plays your character\'s theme.' },
  adv: { function: rpg.advantage, desc: 'Rolls the given roll twice, reports both and selects the higher result.' },
  dadv: { function: rpg.advantage, desc: 'Rolls the given roll twice, reports both and selects the lower result.' },
  disadv: { function: rpg.advantage, desc: 'Alias of +dadv.' },
  b: { function: rpg.bladesRoll, desc: 'Rolls a Blades in the Dark roll.' }
}
// object to turn game strings into game objects
module.exports = { rpg, commands, name, desc }
