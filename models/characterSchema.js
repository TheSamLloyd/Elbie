var mongoose = require('mongoose')
var $Schema = mongoose.Schema

var Schema = new $Schema({
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
    type: $Schema.Types.ObjectId,
    required: true,
    ref: 'Campaign'
  },
  scores: {
    stats: {
      type: Map,
      of: Number
    },
    skills: {
      type: Map,
      of: Number
    }
  },
  attributes: {
    type: $Schema.Types.Mixed
  },
  inventory: [],
  HP: {
    required: false,
    current: {
      type: Number,
      min: [0, 'HP cannot be less than 0'],
      max: [999, 'HP cannot be greater than maximum.']
    },
    maxHP: {
      type: Number,
      min: [1, 'Max HP cannot be less than 1.']
    }
  },
  level: Number,
  exp: {
    type: Number,
    default: 0,
    min: 0
  },
  alive: { type: Boolean, default: true },
  desc: {
    type: String
  },
  theme: {
    type: String
  }
})

Schema.query.byCampaign = function (campaignID) {
  return this.where({ campaign: campaignID })
}
Schema.query.byCampaignAndUserId = function (campaignID, userID) {
  return this.where({ campaign: campaignID, user: userID })
}
Schema.query.byName = function (name) {
  return this.where({$or: [{ name: name }, {nickname: name}]})
}
Schema.query.byCampaignAndName = function (campaignID, name) {
  return this.where({campaign: campaignID, $or: [{ name: name }, {nickname: name}]})
}
Schema.query.byAllNames = function (name) {
  return this.populate('user').where({$or: [{name: name}, {nickname: name}, {'user.name': name}]})
}

Schema.virtual('stats').get(function () { return this.scores.stats }).set(function (skl, score) { this.scores.stats[skl] = score })
Schema.virtual('skill').get(function () { return this.scores.skills }).set(function (skl, score) { this.scores.skills[skl] = score })

var Object = mongoose.model('Character', Schema)

module.exports = {Schema, Object}
