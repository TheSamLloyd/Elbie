// dependencies
import common from '../common'
import { RichEmbed } from 'discord.js'
import { Command } from '../../objects/command'
import { Module, IFunction } from '../module'
import { db as _db } from './models/schema'
import { Character } from './character'
import { Campaign } from './campaign'
import { Die } from './dice'
import { GameSystem } from './systems/game'
const db = _db

// module information
export const rpg: Module = {
  name: 'rpg',
  desc: 'functions to allow basic RPG commands',
  functions: {
    // terminal 
    advantage: (command: Command): void => {
      let text = ''
      if (command.argument.indexOf(',') !== -1) {
        command.reply('You can only do one roll with advantage.')
        return
      } else {
        let rolls = GameSystem.roll(`${command.argument}, ${command.argument}`)
        rolls.forEach(result => {
          text += `${result.dielist}=**${result.total}**\n`
        })
        text += `Result: ${Math.max(...rolls.map(result => result.total))}`
      }
      command.reply(text)
    },
    getCampaign: (command: Command, cb: IFunction): void => {
      Campaign.retrieve(command.server.id, command.channel.id, cb)
    },
    isDM: (command: Command): boolean => {
      let campaign = rpg.functions.getCampaign(command)
      if (typeof campaign == typeof Campaign) {
        return campaign.isDM(command.auth.id)
      }
      else {
        console.warn("Couldn't unwrap Campaign promise.")
        return false
      }
    },
    // terminal
    'listChar:'(command: Command): void {
      console.log('Listing...')
      rpg.functions.getCampaign(command, (campaign: Campaign) => {
        let characters = campaign.characters.map((char: Character) => ({ name: char.name, user: char.user.name }))
        var out = ''
        characters.forEach((char) => {
          out += `• ${char.name} (${char.user})\n`
        })
        console.log(out)
        command.reply(out.trim())
      })
    },
  // terminal
  who: (command: Command): void => {
      if (command.argument === '') {
        var getter
        getter = Character.getChar
      } else {
        getter = Character.getCharByAnyName
      }
      getter(command, (char: Character) => {
        if (char) {
          const displayAttributes = char.attributes.filter(attribute => attribute.display == true)
          var embed = new RichEmbed()
            .setColor('GREEN')
            .setAuthor(char.name + ' (' + char.user.name + ')')
          displayAttributes.forEach(attribute => {
            embed.addField(key + ':', value, true)
          })
          for (var [key, value] of char.scores.stats) {
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
    cast: (command: Command): void => {
      var castlist = {
        mark: ['exp', common.orDef(command.args[0], 1), true],
        hp: ['HP.current', common.orDef(command.args[0], 0), true]
      }
      command.args = castlist[command.command]
      if (command.args[2]) {
        Character.modifyAttr(command, function (attr: string) {
          command.reply(`${command.args[0]}: ${attr}`)
        })
      } else {
        Character.setAttr(command, function (attr: string) {
          command.reply(`${command.args[0]}: ${attr}`)
        })
      }
    },
    bind: (command: Command): void => {
      rpg['functions']['getCampaign'](command, function (campaign: Campaign) {
        if (!campaign) {
          const newCampaign = new db.Campaign({
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
    statRoll: (command: Command) => {
      Character.statRoll(command, this.rollFormat)
    },
    bladesRoll: (command: Command): void => {
      let n: number = parseInt(command.argument)
      var out
      let result: number = 0
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
        return
      }
      out = `${out} - ${outcome}`
      command.reply(out)
      return
    }
  },
  commands: {
    'r': { key: 'statRoll', desc: 'Rolls the default roll for the system defined in the channel. Add a skill, stat, or number to automatically modify it.' },
    'bind': { key: 'bind', desc: 'Binds the channel to a new campaign. The DM should use this function. Syntax is +bind shortname Long Name of Campaign.' },
    'who': { key: 'who', desc: 'Displays information about the users\'s character, or if another user is specified by name or character name, that user\' character.' },
    'list': { key: 'listChar', desc: 'Lists every character and their associated user in the channel\'s associated campaign.' },
    'roll': { key: 'rollFormat', desc: 'Rolls a number of comma-separated rolls in xdy+k, xdy-3 format.' },
    'hp': { key: 'cast', desc: 'With no arguments, displays your current HP. With an integer argument, adjusts HP by that much, limited to the range between max HP and 0.' },
    'mark': { key: 'cast', desc: 'With no arguments, increases your experience by 1 and displays the new value. With an integer argument, adjusts experience by that much.' },
    'levelup': { function: Character.system.levelup, desc: 'If possible, levels up your character and displays your new level. Makes no further stat changes.' },
    'theme': { function: Character.system.playTheme, desc: 'If defined (and the audio module is loaded), plays your character\'s theme.' },
    'adv': { key: 'advantage', desc: 'Rolls the given roll twice, reports both and selects the higher result.' },
    'dadv': { key: 'advantage', desc: 'Rolls the given roll twice, reports both and selects the lower result.' },
    'disadv': { key: 'advantage', desc: 'Alias of +dadv.' },
    'b': { key: 'bladesRoll', desc: 'Rolls a Blades in the Dark roll.' }
  }
}
