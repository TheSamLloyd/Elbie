// dependencies
import common from '../common'
import { MessageEmbed } from 'discord.js'
import { Module, IFunction, Command, ICommands } from '../module'
import { Character } from './character'
import { Campaign } from './campaign'
import { RollResults } from './systems/game'
import nullGame from './systems/null-game'

// module information
class rpg extends Module {
  name: string = 'rpg'
  desc: string = 'functions to allow basic RPG commands'
  constructor() {
    super()
    if (!Campaign.instantiatedAll) Campaign.instatiateAllActiveCampaigns()
  }
  // terminal 
  advantage = async (command: Command): Promise<void> => {
    let text = ''
    if (command.argument.indexOf(',') !== -1) {
      await command.reply('You can only do one roll with advantage.')
      return
    } else {
      let rolls = nullGame.roll(null, `${command.argument}, ${command.argument}`)
      rolls.forEach(result => {
        text += `${result.dielist}=**${result.total}**\n`
      })
      text += `Result: ${Math.max(...rolls.map(roll => roll.total as number))}`
    }
    await command.reply(text)
  }
  getCampaign = async (command: Command): Promise<Campaign | null> => {
    if (!Campaign.instantiatedAll) Campaign.instatiateAllActiveCampaigns()
    return await Campaign.get(command.server.id, command.channel.id)
  }
  // terminal
  listChar = async (command: Command): Promise<void> => {
    console.log('Listing...')
    let campaign: Campaign | null = await this.getCampaign(command)
    if (campaign) {
      let characters = campaign.characters.map((char: Character) => ({ name: char.name, user: char.dbUser ? char.dbUser.name : "" }))
      var out = ''
      characters.forEach((char) => {
        out += `• ${char.name} (${char.user})\n`
      })
      console.log(out)
      await command.reply(out.trim())
    }
    else {
      console.log('Nothing to list.')
    }

  }
  // terminal
  who = async (command: Command): Promise<void> => {
    let campaign: Campaign | null = await this.getCampaign(command)
    if (campaign) {
      if (command.argument === '') {
        let char = await Character.get(command.auth.id, campaign.id)
        console.log(char)
        if (char !== null) {
          let embed = await this.generateEmbed(char)
          console.log(embed.toString())
          await command.reply(embed)
        }
        // get the character by username / name / nickname
      }
    }
    else {
      await command.reply('No campaign found.')
    }
  }
  generateEmbed = async (char: Character): Promise<MessageEmbed> => {
    const displayAttributes = char.attributes.filter(attribute => attribute.display == true)
    var embed = new MessageEmbed()
      .setColor('GREEN')
      .setAuthor(char.name + ' (' + (char.dbUser ? char.dbUser.name : "") + ')')
    displayAttributes.forEach(attribute => {
      embed.addField(`${attribute.key} : ${attribute.value}`, true)
    })
    char.stats.name(stat => {
      embed.addField(`${stat} : ${char.stats[stat]}`, true)
    })
    embed.addField('Description:', (char.desc || 'None'), false)
      .setFooter('Elbeanor')
    if (char.aviURL) {
      embed.setImage(char.aviURL)
    }
    return embed
  }
  rollFormat = async (command: Command): Promise<void> => {
    let campaign: Campaign | null = await this.getCampaign(command)
    console.log(campaign)
    console.log(campaign?.system)
    let char = null
    let sys
    if (campaign) {
      sys = await campaign.system()
      char = campaign.characters.filter((char: Character) => char.dbUser?.id == command.auth.id)[0]
    }
    else {
      sys = nullGame
    }
    console.log(`${char?.name}`)
    const output: RollResults[] = sys.roll(char, command.argument)
    let text: string = ''
    output.forEach((roll) => {
      text += roll.iroll + ': ' + roll.dielist + '=**' + roll.total + '**\n'
    })
    await command.reply(text.trim())

  }


  summary = async (command: Command): Promise<void> => {
    let outtext: string = ""
    let campaign: Campaign | null = await this.getCampaign(command)
    if (campaign) {
      let sys = await campaign.system()
      outtext += `${campaign.name} running in ${sys.name}\n`
      outtext += `${campaign.characters.map((char) => char.name).join("\n")}`
      await command.reply(outtext)
    }
    else {
      console.log('nothing to summarize!')
    }

  }
  commands: ICommands = {
    'who': { key: this.who, desc: 'Displays information about the users\'s character, or if another user is specified by name or character name, that user\' character.' },
    'list': { key: this.listChar, desc: 'Lists every character and their associated user in the channel\'s associated campaign.' },
    'adv': { key: this.advantage, desc: 'Rolls the given roll twice, reports both and selects the higher result.' },
    'dadv': { key: this.advantage, desc: 'Rolls the given roll twice, reports both and selects the lower result.' },
    'disadv': { key: this.advantage, desc: 'Alias of +dadv.' },
    'roll': { key: this.rollFormat, desc: 'Makes a roll in the defined system, or a standard xDy roll if not defined.' },
    'r': { key: this.rollFormat, desc: 'Alias of +roll' },
    'summary': { key: this.summary, desc: 'Prints a summary of the campaign in the channel.' }
  }
}

export default new rpg()