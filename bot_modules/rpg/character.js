// dependencies
const common = require('../common.js').common
const gameList = {
  'Dungeon World': require('./systems/dungeon-world.js'),
  'Masks': require('./systems/masks.js'),
  'Dungeons and Dragons 3.5e': require('./systems/dungeons-and-dragons-3-5e.js')
}
const audio = require('../audio') || false

const DB_URI = process.env.MONGODB_URI
const mongoose = require('mongoose')
const db = require('../../models/schema.js')
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
var Character = {
  getActiveCampaign: function (Command, cb) {
    db.Campaign.Object.findOne().byCommand(Command).exec(function (err, campaign) {
      if (err) {
        console.error(err)
        Command.channel.send('Ran into an error in the getActiveCampaign function.')
      } else {
        console.log(campaign)
        cb(campaign)
      }
    })
  },
  getChar: function (Command, cb) {
    Character.getActiveCampaign(Command, function (activeCampaign) {
      db.Character.Object.findOne().byCampaignAndUserId(activeCampaign.id, Command.auth.id).populate('user').exec(function (err, activeCharacter) {
        if (err) {
          console.error(err)
          Command.channel.send('Ran into a problem in the getChar function.')
        } else { cb(activeCharacter) }
      })
    })
  },
  getCharByAnyName: function (Command, cb) {
    Character.getActiveCampaign(Command, function (activeCampaign) {
      db.Character.Object.find().byCampaign(activeCampaign).populate('user').exec(function (err, characterArray) {
        if (err) {
          console.error(err)
          Command.channel.send('Ran into a problem in the getChar function.')
        } else {
          characterArray = characterArray.filter(function (value) {
            return value.user.name === Command.argument || value.name === Command.argument || value.nickname === Command.argument
          })
          if (characterArray === []) {
            return Command.channel.send('Could not find character with that name, nickname, player, or id.')
          } else {
            cb(characterArray[0])
          }
        }
      })
    })
  },
  getSystem: function (Command, cb) {
    Character.getActiveCampaign(Command, function (activeCampaign) {
      db.System.Object.findById(activeCampaign.system, function (err, system) {
        if (err) {
          console.error(err)
          Command.channel.send('Ran into a problem in the getSystem function.')
        } else {
          cb(system)
        }
      })
    })
  },
  save: function (char, cb) {
    char.save(function (err, newChar) {
      if (err) {
        console.error(err)
      } else {
        cb(newChar)
      }
    })
  },
  setAttr: function (Command, cb) {
    Character.getChar(Command, (char) => {
      var attr = Command.args[0]
      var value = Command.args.slice(1).join(' ')
      cb(char[attr].set(attr, value))
    })
  },
  modifyAttr: function (Command, cb) {
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
  },
  getAttr: function (Command, cb) {
    Character.getChar(Command, (char) => {
      var attr = Command.args[0]
      cb(char.get(attr))
    })
  },
  statRoll: function (Command, cb) {
    Character.getChar(Command, function (char) {
      Character.getSystem(Command, function (sys) {
        if (!(char && sys)) {
          console.error(`Problem retrieving either character or system: ${char} / ${sys}`)
          Command.channel.send('Had trouble retrieving character or system.')
        }
        var system = gameList[sys.name]
        var stat = system.statAlias[Command.args[0]] || common.caps(Command.args[0])
        var mod
        var postfix = Command.args.slice(1)
        try {
          mod = system.mod(char.stats.get(stat))
        } catch (err) {
          Command.channel.send(`Ran into an error fetching stats... ${err.name}`)
          mod = 0
        }
        var roll = `${system.defRoll}+${mod}+${postfix}`
        Command.argument = roll
        cb(Command)
      })
    })
  },
  // terminal
  levelup: function (Command) {
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
  },
  theme: function (Command) {
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
