var mongoose = require('mongoose')
var Schema = mongoose.Schema

var UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  _id: {
    type: String,
    required: true
  },
  characters: {
    type: [Schema.Types.ObjectId],
    ref: 'Character'
  },
  dm: {
    type: [Schema.Types.ObjectId],
    ref: 'Campaign'
  }
})

var CampaignSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  shortname: {
    type: String
  },
  channel: {
    type: String,
    required: function () {
      return !this.serverWide
    },
    index: true
  },
  server: {
    type: String,
    required: true
  },
  dm: {
    type: String,
    required: true,
    ref: 'User'
  },
  theme: String,
  active: { type: Boolean, default: true },
  system: { type: Schema.Types.ObjectId, required: true, ref: 'System' },
  serverWide: {
    type: Boolean,
    required: false,
    default: false
  }
})

var CharacterSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  nickname: {
    type: String
  },
  user: {
    type: String,
    required: true,
    ref: 'User',
    index: true
  },
  campaign: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Campaign'
  },
  attributes: {
    type: Map,
    of: String
  },
  scores: {
    stats: {
      type: Map,
      of: Number
    },
    skills: {
      type: Map,
      of: Number
    },
    other: Schema.Types.Mixed
  },
  inventory: [],
  maxHP: {
    type: Number,
    required: function () {
      return (this.HP >= 0)
    }
  },
  HP: Number,
  level: Number,
  exp: {
    type: Number,
    default: 0
  },
  alive: { type: Boolean, default: true },
  desc: {
    type: String
  },
  theme: {
    type: String
  }
})

var SystemSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  defRoll: {
    type: String,
    enum: ['1d20', '2d6'],
    required: false
  }
})

var UserObject = mongoose.model('User', UserSchema)
var CampaignObject = mongoose.model('Campaign', CampaignSchema)
var CharacterObject = mongoose.model('Character', CharacterSchema)
var SystemObject = mongoose.model('System', SystemSchema)

module.exports = { UserObject, CampaignObject, CharacterObject, SystemObject }
