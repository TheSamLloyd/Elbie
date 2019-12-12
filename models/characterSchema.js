var mongoose = require('mongoose')
var Schema = mongoose.Schema

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
  scores: {
    stats: {
      type: Schema.Types.Mixed
    },
    skills: {
      type: Schema.Types.Mixed
    }
  },
  attributes: {
    type: Schema.Types.Mixed
  },
  inventory: [],
  maxHP: Number,
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

module.exports = CharacterSchema
