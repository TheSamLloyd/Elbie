var mongoose = require('mongoose')

const UserSchema = require('./userSchema.js')
const CampaignSchema = require('./userSchema.js')
const CharacterSchema = require('./userSchema.js')
const SystemSchema = require('./userSchema.js')

var UserObject = mongoose.model('User', UserSchema)
var CampaignObject = mongoose.model('Campaign', CampaignSchema)
var CharacterObject = mongoose.model('Character', CharacterSchema)
var SystemObject = mongoose.model('System', SystemSchema)

module.exports = { UserObject, CampaignObject, CharacterObject, SystemObject }
