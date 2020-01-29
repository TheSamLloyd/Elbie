// dependencies
import common from '../common'
import { RichEmbed } from 'discord.js'
import { Command } from '../../objects/command'
import { Module, IFunction, ICommands } from '../module'
import { db } from './models/schema'
import { Character } from './character'
import { Campaign } from './campaign'
import { Die } from './dice'
import { GameSystem } from './systems/game'
import characterSchema from './models/characterSchema'

// module information
class rpg extends Module {
  name: string = 'rpg'
  desc: string = 'functions to allow basic RPG commands'
  // terminal 
  advantage = (command: Command): void => {
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
  }
  getCampaign = (command: Command, cb: IFunction): void => {
    Campaign.retrieve(command.server.id, command.channel.id, cb)
  }
  // terminal
  listChar = (command: Command): void => {
    console.log('Listing...')
    this.getCampaign(command, (campaign: Campaign) => {
      let characters = campaign.characters.map((char: Character) => ({ name: char.name, user: char.dbUser ? char.dbUser.name : "" }))
      var out = ''
      characters.forEach((char) => {
        out += `• ${char.name} (${char.user})\n`
      })
      console.log(out)
      command.reply(out.trim())
    })
  }
  // terminal
  who = (command: Command): void => {
    this.getCampaign(command, (campaign: Campaign) => {
      if (command.argument === '') {
        Character.get(command.auth.id, campaign.id, (char: Character) => {
          command.reply(this.generateEmbed(char))
        })
      } else {
        // get the character by username / name / nickname
      }
    })
  }
  generateEmbed = (char: Character): RichEmbed => {
    const displayAttributes = char.attributes.filter(attribute => attribute.display == true)
    var embed = new RichEmbed()
      .setColor('GREEN')
      .setAuthor(char.name + ' (' + (char.dbUser ? char.dbUser.name : "") + ')')
    displayAttributes.forEach(attribute => {
      embed.addField(`${attribute.key} : ${attribute.value}`, true)
    })
    Object.keys(char.stats).forEach(stat=> {
      embed.addField(`${stat} : ${char.stats[stat]}`, true)
    })
    embed.addField('Description:', (char.desc || 'None'), false)
      .setFooter('Elbeanor')
    if (char.aviURL) {
      embed.setImage(char.aviURL)
    }
    return embed
  }
  commands: ICommands = {
    'who': { key: this.who, desc: 'Displays information about the users\'s character, or if another user is specified by name or character name, that user\' character.' },
    'list': { key: this.listChar, desc: 'Lists every character and their associated user in the channel\'s associated campaign.' },
    'adv': { key: this.advantage, desc: 'Rolls the given roll twice, reports both and selects the higher result.' },
    'dadv': { key: this.advantage, desc: 'Rolls the given roll twice, reports both and selects the lower result.' },
    'disadv': { key: this.advantage, desc: 'Alias of +dadv.' }
  }
}

export default new rpg()