// dependencies
import { Common } from '../common'
import { Masks } from './systems/masks'
import { DungeonWorld } from './systems/dungeon-world'
import { DnD35 } from './systems/dungeons-and-dragons-3-5e'
const common = Common.functions
const gameList = {
  'Dungeon World': DungeonWorld,
  'Masks': Masks,
  'Dungeons and Dragons 3.5e': DnD35
}
const audio = require('../audio') || false

const DB_URI = process.env.MONGODB_URI
import mongoose from 'mongoose'
import { Command } from '../../objects/command'
import { db } from '../../models/schema'
import { ICharacter } from '../../models/characterSchema'
import { ISystem } from '../../models/systemSchema'
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
export class Character extends Document implements ICharacter {
  static getActiveCampaign = function (command: Command, cb) {
    db.Campaign.findOne().where({$or:[{channel:command.channel}, {server:command.server, serverWide:true}]}).exec(function (err: object, campaign) {
      if (err) {
        console.error(err)
        command.reply('Ran into an error in the getActiveCampaign function.')
      } else {
        console.log(campaign)
        cb(campaign)
      }
    })
  }
  static getChar = function (command: Command, cb) {
    Character.getActiveCampaign(command, function (activeCampaign) {
      db.Character.findOne({ $where: { campaign: activeCampaign.id, user: command.auth.id } }).populate('user').exec(function (err, activeCharacter) {
        if (err) {
          console.error(err)
          command.reply('Ran into a problem in the getChar function.')
        } else { cb(activeCharacter) }
      })
    })
  }
  constructor(){
    super()
  }
  getCharByAnyName = function (Command, cb) {
    Command.argument = common.caps(Command.argument.toLowerCase())
    Character.getActiveCampaign(Command, function (activeCampaign) {
      db.Character.find().where({campaign:activeCampaign}).populate('user').exec(function (err, characterArray) {
        if (err) {
          console.error(err)
          Command.channel.send('Ran into a problem in the getChar function.')
        } else {
          characterArray = characterArray.filter(function (value) {
            return value.user.name === Command.argument || value.name === Command.argument || value.nickname === Command.argument
          })
          if (characterArray === []) {
            return Command.channel.send('Could not find character with that name, nickname, player, or id.')
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
  getSystem = function (command: Command, cb): void {
    Character.getActiveCampaign(command, function (activeCampaign) {
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
  setAttr = function (command: Command, cb): void {
    Character.getChar(command, (char) => {
      var attr = command.args[0]
      var value = command.args.slice(1).join(' ')
      cb(char[attr].set(attr, value))
    })
  }
  modifyAttr = function (Command, cb) {
    Character.getChar(Command, (char) => {
      var attr = Command.args[0]
      var value = Command.args[1]
      var current = char.get(attr)
      char.set(attr, current + common.typed(value))
      if (attr === 'HP.current') {
        console.log('checking HP')
        char.set(attr, Math.min(char.HP.maxHP, Math.max(0, char.HP.current)))
      }
      char.save(function (err, val) {
        if (err) {
          console.error(err)
          Command.channel.send('Encountered an error while saving character to the DB.')
        }
        cb(val.get(attr))
      })
    })
  }
  getAttr = function (cmd:Command, cb) {
    Character.getChar(cmd, (char) => {
      var attr = cmd.args[0]
      cb(char.get(attr))
    })
  }
  statRoll = function (Command, cb) {
    Character.getChar(Command, function (char) {
      db.System.findById(char.populate('campaign')['campaign']['system']).exec((err, sys:ISystem)=>{
        if (!(char && sys)) {
          console.error(`Problem retrieving either character or system: ${char} / ${sys}`)
          Command.channel.send('Had trouble retrieving character or system.')
        }
        var target = Command.args[0] ? Command.args[0].toLowerCase() : ''
        var system = gameList[sys.name]
        var roll, mod, stat
        var postfix = Command.args.slice(1)
        var oper = ''
        if (isNaN(parseInt(target)) && target !== '') {
          if (system.skills && char['scores']['skills']) {
            if (system.skills[target]) {
              // if this is a skill roll
              stat = system.statAlias[system.skills[target]]
              mod = `${system.mod(char.scores.stats.get(stat))}+${char['scores']['skills'].get(target)}`
            } else if (system.statAlias[target] || Object.values(system.statAlias).indexOf(common.caps(target)) !== -1) {
              // if this is a stat roll
              stat = system.statAlias[target] ? system.statAlias[target] : common.caps(target)
              mod = system.mod(char.stats.get(stat))
            }
          } else {
            Command.channel.send(`Ran into an error fetching stats...`)
            mod = 0
          }
          if (postfix.join('+')) { oper = '+' }
          console.log(stat, mod)
          roll = `${system.defRoll}+${mod}${oper}${postfix}`
          Command.argument = roll
          cb(Command)
        } else if (parseInt(target) || target === '') {
          if (target === '') {
            roll = `${system.defRoll}`
          } else {
            postfix = Command.args.slice(1)
            oper = ''
            if (postfix.join('+')) { oper = '+' }
            roll = `${system.defRoll}+${target}${oper}${postfix}`
          }
          Command.argument = roll
          cb(Command)
        }
      })
    })
  }
  // terminal
  levelup = function (Command): void {
    Character.getChar(Command, function (char) {
      Character.getSystem(Command, function (sys) {
        var system = gameList[sys.name]
        var canLevel = system.levelup(char)
        if (canLevel) {
          Command.args[0] = 'level'
          Command.args[1] = 1
          var success = Character.modifyAttr(Command)
          if (success) Command.channel.send(`Leveled up to ${success}`)
          else Command.channel.send(success)
        } else Command.channel.send('Could not level up. Check EXP.')
      })
    })
  }
  playTheme = function (Command) {
    if (audio) {
      Character.getChar(Command, function (char) {
        Command.argument = `https://www.youtube.com/watch?v=${char.get('theme')}`
        console.log(char.get('theme'))
        console.log(Command.argument)
        audio.audio.play(Command)
      })
    } else {
      Command.channel.send('audio module not installed or not working.')
    }
  }
}
module.exports = { Character, gameList, db }
