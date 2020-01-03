// dependencies
import { Common } from '../common'
const common = Common.functions
import { RichEmbed } from 'discord.js'
import { Command } from '../../objects/command'
import { Module } from '../module'
import { Character as _Character, db as _db } from './character'
const Character = _Character
const db = _db

// module information
export const rpg = new Module({
name:'rpg',
desc:'functions to allow basic RPG commands',
functions:{
  roll (command:Command):object {
    var rolls = command.argument.split(',')
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
            dielist.push(common['randInt'](1, parseInt(k[1])))
          }
        } else {
          console.log('Empty or other weird length, disregarding...')
        }
      })
      var tTotal = common['sum'](dielist)
      var valid = !(isNaN(tTotal))
      results[index] = { roll: iroll, dielist: dielist, total: tTotal, valid: valid }
    })
    console.log(results)
    return results
  },
  // terminal
  advantage (command:Command):void {
    if (command.argument.indexOf(',') !== -1) {
      command.reply('You can only do one roll with advantage.')
      return null
    } else {
      command.argument = command.argument + ',' + command.argument
      var output = rpg.roll(command)
      var text = ''
      if (output[0].valid) {
        var bool = output[0].total > output[1].total ? 0 : 1
        for (var i = 0; i <= 1; i++) {
          text += output[i].roll + ': ' + output[i].dielist + '=**' + output[i].total + '**\n'
        }
        if (command.command === 'adv') {
          text += 'Result: **' + output[bool].total + '**'
        }
        if (command.command === 'disadv' || command.command === 'dadv') {
          text += 'Result: **' + output[1 - bool].total + '**'
        }
      }
      command.reply(text)
    }
  },
  // terminal
  rollFormat (command:Command):void {
    var output = rpg.roll(command)
    var text = ''
    for (var i = 0; i < Object.keys(output).length; i++) {
      if (output[i].valid) {
        text += output[i].roll + ': ' + output[i].dielist + '=**' + output[i].total + '**\n'
      } else {
        text += output[i].roll + ': malformed roll'
      }
    }
    command.reply(text.trim())
  },
  getCampaign (command:Command, cb):void {
    try {
      db.Campaign.Object.findOne().bycommand(command).exec(function (err, campaign) {
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
  isDM (command:Command, cb):void {
    Character.getActiveCampaign(command, function (err, campaign) {
      if (err) console.log(err)
      cb(campaign.dm === command.auth.id)
    })
  },
  getCharByPlayer (command:Command, cb):void {
    var query = command.argument !== '' ? { name: common.caps(command.argument) } : { id: command.auth.id }
    console.log(query)
    db.User.Object.findOne(query, function (err, user) {
      if (err) console.error(err)
      if (!user) return cb(null)
      console.log(user)
      Character.getChar(command).populate('user').exec(function (err, char) {
        if (err) console.log(err)
        cb(err, char)
      })
    })
  },
  getCharByName (command:Command, cb):void {
    rpg.getCampaign(command, campaign => {
      db.Character.Object.findOne().byCampaignAndName(campaign.id, common.caps(command.argument))
        .populate('user')
        .exec(function (err, char) {
          if (err) console.error(err)
          console.log(char)
          cb(char)
        })
    })
  },
  // terminal
  listChar (command:Command):void {
    console.log('Listing...')
    rpg.getCampaign(command, campaign => {
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
          command.reply(out.trim())
        })
      })
    })
  },
  // terminal
  who (command:Command):void {
    if (command.argument === '') {
      var getter
      getter = Character.getChar
    } else {
      getter = Character.getCharByAnyName
    }
    getter(command, char => {
      if (char) {
        var embed = new RichEmbed()
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
          command.reply(embed)
        } catch (err) {
          command.reply('Could not send rich embed -- may not have permission in this channel or server.')
        }
      } else {
        command.reply(`Couldn't find a character in the active campaign scope with name, nickname, or user's name "${command.argument}".`)
      }
    })
  },
  cast (command:Command):void {
    var castlist = {
      mark: ['exp', common.orDef(command.args[0], 1), true],
      hp: ['HP.current', common.orDef(command.args[0], 0), true]
    }
    command.args = castlist[command.command]
    if (command.args[2]) {
      Character.modifyAttr(command, function (attr) {
        command.reply(`${command.args[0]}: ${attr}`)
      })
    } else {
      Character.setAttr(command, function (attr) {
        command.reply(`${command.args[0]}: ${attr}`)
      })
    }
  },
  bind (command:Command):void {
    rpg.getCampaign(command, function (campaign) {
      if (!campaign) {
        const newCampaign = new db.CampaignObject({
          dm: command.auth.id,
          channel: command.channel.id,
          shtname: command.args[0],
          name: command.args.slice(1).join(' ')
        })
        newCampaign.save(function (err, campaign) {
          if (err) console.error(err)
          else {
            command.reply(`Successfully created new campaign: ${campaign.name}
          Please finish setup on the web interface [[link forthcoming]]`)
          }
        })
      } else {
        command.reply('Already defined a campaign for this channel.')
      }
    })
  },
  statRoll (command:Command) {
    Character.statRoll(command, rpg.rollFormat)
  },
  bladesRoll (command:Command) {
    var n = parseInt(command.argument)
    var out
    var result
    var critical = 0
    var outcome
    if (n <= 0) {
      var dice1 = common['randInt'](1, 6)
      var dice2 = common['randInt'](1, 6)
      result = Math.min(dice1, dice2)
      out = `${n}d6: [${dice1}, ${dice2}]: ${result}`
    } else if (n > 0) {
      var dice = []
      for (var i = 0; i < n; i++) {
        dice.push(common['randInt'](1, 6))
      }
      result = Math.max(...dice)
      critical = dice.filter(die => die === 6).length
      out = `${n}d6: ${dice}: ${result}`
    }
    critical -= 1
    if (critical) outcome = 'Critical success'
    else if (result === 6) outcome = 'Full success'
    else if (result >= 4) outcome = 'Partial success'
    else if (result >= 1) outcome = 'Bad outcome'
    else if (isNaN(n)) {
      command.reply('Malformed roll.')
      return null
    }
    out = `${out} - ${outcome}`
    command.reply(out)
    return null
  }
},
commands : {
  r: { function: rpg.statRoll, desc: 'Rolls the default roll for the system defined in the channel. Add a skill, stat, or number to automatically modify it.' },
  bind: { function: rpg.bind, desc: 'Binds the channel to a new campaign. The DM should use this function. Syntax is +bind shortname Long Name of Campaign.' },
  who: { function: rpg.who, desc: 'Displays information about the users\'s character, or if another user is specified by name or character name, that user\' character.' },
  list: { function: rpg.listChar, desc: 'Lists every character and their associated user in the channel\'s associated campaign.' },
  roll: { function: rpg.rollFormat, desc: 'Rolls a number of comma-separated rolls in xdy+k, xdy-3 format.' },
  hp: { function: rpg.cast, desc: 'With no arguments, displays your current HP. With an integer argument, adjusts HP by that much, limited to the range between max HP and 0.' },
  mark: { function: rpg.cast, desc: 'With no arguments, increases your experience by 1 and displays the new value. With an integer argument, adjusts experience by that much.' },
  levelup: { function: Character.levelup, desc: 'If possible, levels up your character and displays your new level. Makes no further stat changes.' },
  theme: { function: Character.theme, desc: 'If defined (and the audio module is loaded), plays your character\'s theme.' },
  adv: { function: rpg.advantage, desc: 'Rolls the given roll twice, reports both and selects the higher result.' },
  dadv: { function: rpg.advantage, desc: 'Rolls the given roll twice, reports both and selects the lower result.' },
  disadv: { function: rpg.advantage, desc: 'Alias of +dadv.' },
  b: { function: rpg.bladesRoll, desc: 'Rolls a Blades in the Dark roll.' }
}
})
