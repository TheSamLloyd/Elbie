var mongoose = require('mongoose')
var $Schema = mongoose.Schema

var Schema = new $Schema({
  name: {
    type: String,
    required: true
  },
  shortname: {
    type: String
  },
  channel: {
    type: String,
    required: false,
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
  system: { type: $Schema.Types.ObjectId, required: true, ref: 'System' },
  serverWide: {
    type: Boolean,
    required: true,
    default: false
  }
})

Schema.query.byCommand = function (Command) {
  return this.where({$or: [{channel: Command.channel.id}, {server: Command.server.id, serverWide: true}]})
}

var Object = mongoose.model('Campaign', Schema)

module.exports = {Schema, Object}
