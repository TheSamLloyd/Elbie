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
    required: true,
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
  active: {type: Boolean, default: true},
  system: {type: Schema.Types.ObjectId, required: true, ref: 'System'}
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
  stats: {
    type: Schema.Types.Mixed
  },
  attributes: {
    type: Schema.Types.Mixed
  },
  inventory: [],
  maxHP: Number,
  HP: Number,
  level: Number,
  exp: Number,
  alive: {type: Boolean, default: true}
})

var SystemSchema = new Schema({
  name: {
    type: String,
    required: true
  }
})
SystemSchema.virtual('path').get(function () {
  return `../bot_modules/rpg/${this.name.replace(/\W+/g, '-').toLowerCase()}.js`
})

var UserObject = mongoose.model('User', UserSchema)
var CampaignObject = mongoose.model('Campaign', CampaignSchema)
var CharacterObject = mongoose.model('Character', CharacterSchema)
var SystemObject = mongoose.model('System', SystemSchema)

module.exports = {UserObject, CampaignObject, CharacterObject, SystemObject}
