// dependencies
import Common from '../common'
import gameList from './systems/index'
const audio = require('../audio') || false

const DB_URI = process.env.MONGODB_URI || ""
import mongoose from 'mongoose'
import { Command } from '../../objects/command'
import { ICallback } from '../module'
import { db } from './models/schema'
import { ICampaign } from './models/campaignSchema'
import { ICharacter } from './models/characterSchema'
import { ISystem } from './models/systemSchema'
mongoose.set('useNewUrlParser', true)
mongoose.set('useCreateIndex', true)
mongoose.set('useUnifiedTopology', true)

mongoose.connect(DB_URI).then(
  () => {
    console.log('DB connection ready')
  },
  err => { console.log(`DB connection failed... \n${err}`) }
)

// Character object designed to encapsulate Character functions
export class Character extends db.Character {
  static getActiveCampaign = function (command: Command, cb: ICallback) {
    db.Campaign.findOne().where({ $or: [{ channel: command.channel }, { server: command.server, serverWide: true }] }).exec(function (err: object, campaign) {
      if (err) {
        console.error(err)
        command.reply('Ran into an error in the getActiveCampaign function.')
      } else {
        console.log(campaign)
        cb(campaign)
      }
    })
  }
  static getChar = function (command: Command, cb: ICallback) {
    Character.getActiveCampaign(command, function (activeCampaign: ICampaign) {
      db.Character.findOne({ $where: { campaign: activeCampaign.id, user: command.auth.id } }).populate('user').exec(function (err, activeCharacter) {
        if (err) {
          console.error(err)
          command.reply('Ran into a problem in the getChar function.')
        } else { cb(activeCharacter) }
      })
    })
  }
  getCharByAnyName = function (cmd: Command, cb: ICallback) {
    cmd.argument = Common.caps(cmd.argument.toLowerCase())
    Character.getActiveCampaign(cmd, function (activeCampaign: ICampaign) {
      db.Character.find().where({ campaign: activeCampaign }).populate('user').exec(function (err, characterArray) {
        if (err) {
          console.error(err)
          cmd.reply('Ran into a problem in the getChar function.')
        } else {
          characterArray = characterArray.filter(function (value) {
            return value.user.name === cmd.argument || value.name === cmd.argument || value.nickname === cmd.argument
          })
          if (characterArray === []) {
            return cmd.reply('Could not find character with that name, nickname, player, or id.')
          } else if (characterArray.length > 1) {
            console.warn('More than 1 character found -- returning first.')
            cb(characterArray[0])
          } else {
            cb(characterArray[0])
          }
        }
      })
    })
  }
  getSystem = function (command: Command, cb: ICallback): void {
    Character.getActiveCampaign(command, function (activeCampaign: ICampaign) {
      db.System.findById(activeCampaign.system, function (err, system) {
        if (err) {
          console.error(err)
          command.reply('Ran into a problem in the getSystem function.')
        } else {
          cb(system)
        }
      })
    })
  }
  setAttr = function (command: Command, cb: ICallback): void {
    Character.getChar(command, (char: ICharacter) => {
      var attr = command.args[0]
      var value = command.args.slice(1).join(' ')
      cb(char.set(attr, value))
    })
  }
  modifyAttr = function (cmd: Command, cb: ICallback) {
    Character.getChar(cmd, (char: ICharacter) => {
      var attr = cmd.args[0]
      var value = cmd.args[1]
      var current = char.get(attr)
      char.set(attr, current + Common.typed(value))
      if (attr === 'HP.current') {
        console.log('checking HP')
        char.set(attr, Math.min(char.HP.maxHP, Math.max(0, char.HP.current)))
      }
      char.save(function (err, val) {
        if (err) {
          console.error(err)
          cmd.reply('Encountered an error while saving character to the DB.')
        }
        cb(val.get(attr))
      })
    })
  }
  getAttr = function (cmd: Command, cb: ICallback) {
    Character.getChar(cmd, (char: ICharacter) => {
      var attr = cmd.args[0]
      cb(char.get(attr))
    })
  }
  statRoll = function (cmd: Command, cb: ICallback) {
    Character.getChar(cmd, function (char: ICharacter) {
      db.System.findById(char.populate('campaign')['campaign']['system']).exec((err, sys) => {
        if (!(char && sys)) {
          console.error(`Problem retrieving either character or system: ${char} / ${sys}`)
          cmd.reply('Had trouble retrieving character or system.')
        }
        var target = cmd.args[0] ? cmd.args[0].toLowerCase() : ''
        var system = gameList.get(sys.name)
        var roll, mod, stat
        var postfix = cmd.args.slice(1)
        var oper = ''
        if (isNaN(parseInt(target)) && target !== '') {
          if (system.skills && char['scores']['skills']) {
            if (system.skills[target]) {
              // if this is a skill roll
              stat = system.statAlias[system.skills[target]]
              mod = `${system.mod(char.scores.stats.get(stat))}+${char.skills.get(target)}`
            } else if (system.statAlias[target] || Object.values(system.statAlias).indexOf(Common.caps(target)) !== -1) {
              // if this is a stat roll
              stat = system.statAlias[target] ? system.statAlias[target] : Common.caps(target)
              mod = system.mod(char.get(stat))
            }
          } else {
            cmd.reply(`Ran into an error fetching stats...`)
            mod = 0
          }
          if (postfix.join('+')) { oper = '+' }
          console.log(stat, mod)
          roll = `${system.defRoll}+${mod}${oper}${postfix}`
          cmd.argument = roll
          cb(cmd)
        } else if (parseInt(target) || target === '') {
          if (target === '') {
            roll = `${system.defRoll}`
          } else {
            postfix = cmd.args.slice(1)
            oper = ''
            if (postfix.join('+')) { oper = '+' }
            roll = `${system.defRoll}+${target}${oper}${postfix}`
          }
          cmd.argument = roll
          cb(Command)
        }
      })
    })
  }
  // terminal
  levelup = function (cmd: Command): void {
    Character.getChar(cmd, function (char: Character) {
      db.Character.populate('campaign').populate('campaign.system').exec((char)=> {
        var system = gameList[sys.name]
        var canLevel = system.levelup(char)
        if (canLevel) {
          cmd.args[0] = 'level'
          cmd.args[1] = "1"
          var success = Character.modifyAttr(Command)
          if (success) cmd.reply(`Leveled up to ${success}`)
          else cmd.reply(success)
        } else cmd.reply('Could not level up. Check EXP.')
      })
    })
  }
  playTheme = function (cmd:Command) {
    if (audio) {
      Character.getChar(cmd, function (char:ICharacter) {
        cmd.argument = `https://www.youtube.com/watch?v=${char.get('theme')}`
        console.log(char.get('theme'))
        console.log(cmd.argument)
        audio.audio.play(Command)
      })
    } else {
      cmd.reply('audio module not installed or not working.')
    }
  }
}
module.exports = { Character, gameList, db }
