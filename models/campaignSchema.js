var mongoose = require('mongoose')
var Schema = mongoose.Schema

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

CampaignSchema.query.byCommand = function (Command) {
  return this.where({$or: [{channel: Command.channel}, {server: Command.server, serverWide: true}]})
}

module.exports = CampaignSchema
