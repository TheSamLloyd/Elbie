// dependencies
const common = require('../common.js').common
const gameList = {
  'Dungeon World': require('./dungeon-world.js'),
  'Masks': require('./masks.js')
}
const audio = require('../audio') || false

const DB_URI = process.env.MONGODB_URI
const mongoose = require('mongoose')
const db = require('../../models/schema.js')
mongoose.connect(DB_URI, { useNewUrlParser: true }).then(
  () => {
    console.log('DB connection ready')
  },
  err => { console.log(`DB connection failed... \n${err}`) }
)

// Character object designed to encapsulate Character functions
var Character = {
  getChar: function (Command, cb) {
    db.CampaignObject.findOne({ channel: Command.channel.id }, function (err, campaign) {
      if (err) return console.error(err)
      db.CharacterObject.findOne({ $and: [{ campaign: campaign.id }, { user: Command.auth.id }] }, function (err, char) {
        if (err) return console.error(err)
        db.UserObject.populate(char, { path: 'user' }, function (err, char) {
          if (err) return console.error(err)
          cb(char)
        })
      })
    })
  },
  getStats: function (Command, cb) {
    Character.getChar(Command, function (char) {
      var stats = Object.keys(char.stats)
      cb(stats)
    })
  },
  getSystem: function (Command, cb) {
    db.CampaignObject.findOne({ channel: Command.channel.id }, function (err, campaign) {
      if (err) console.error(err)
      db.SystemObject.populate(campaign, { path: 'system' }, function (err, campaign) {
        if (err) console.error(err)
        console.log(campaign)
        cb(campaign.system.name)
      })
    })
  },
  save: function (char, cb) {
    char.save(function (err, newChar) {
      if (err) console.error(err)
      cb(newChar)
    })
  },
  setAttr: function (Command, cb) {
    Character.getChar(Command, (char) => {
      var attr = Command.args[0]
      var value = Command.args.slice(1).join(' ')
      char[attr] = common.typed(value)
      Character.save(char, (newChar) => {
        cb(newChar[attr])
      })
    })
  },
  modifyAttr: function (Command, cb) {
    Character.getChar(Command, (char) => {
      var attr = Command.args[0]
      var value = Command.args[1]
      char[attr] += common.typed(value)
      console.log(attr)
      if (attr === 'HP') {
        console.log('checking HP')
        char[attr] = Math.min(char.maxHP, Math.max(0, char.HP))
      }
      Character.save(char, (newChar) => {
        cb(newChar[attr])
      })
    })
  },
  getAttr: function (Command, cb) {
    Character.getChar(Command, (char) => {
      var attr = Command.args[0]
      try {
        if (!char[attr] & char[attr] !== 0) { console.log(char[attr]); cb(char[attr]) } else Command.channel.send(`Could not fetch attribute ${attr} -- query returned undefined.`)
      } catch (err) {
        console.error(err)
        Command.channel.send('Could not fetch attribute ' + attr)
      }
    })
  },
  statRoll: function (Command, cb) {
    Character.getChar(Command, function (char) {
      Character.getSystem(Command, function (sys) {
        var system = gameList[sys]
        var stat = system.statAlias[Command.args[0]]
        var mod
        try {
          mod = system.mod(char.stats[stat])
        } catch (err) {
          console.log(err)
          mod = 0
        }
        var roll = `${system.defRoll}+${mod}`
        Command.argument = roll
        cb(Command)
      })
    })
  },
  // terminal
  levelup: function (Command) {
    Character.getChar(Command, function (char) {
      Character.getSystem(Command, function (sys) {
        var system = gameList[sys]
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
  },
  theme: function (Command) {
    if (audio) {
      Character.getChar(Command, function (char) {
        Command.argument = `https://www.youtube.com/watch?v=${char.get('theme')}`
        console.log(char)
        console.log(Object.keys(char))
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
