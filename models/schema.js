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
    required: true
  },
  server: {
    type: String,
    required: true
  },
  dm: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  theme: String,
  active: {type: Boolean, default: true}
})

var CharacterSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  campaign: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Campaign'
  },
  stats: {
    type: Schema.Types.Mixed
  },
  maxHP: Number,
  currentHP: Number,
  level: Number,
  exp: Number,
  alive: {type: Boolean, default: true}
})

var UserObject = mongoose.model('User', UserSchema)
var CampaignObject = mongoose.model('Campaign', CampaignSchema)
var CharacterObject = mongoose.model('Character', CharacterSchema)

module.exports = {UserObject, CampaignObject, CharacterObject}
