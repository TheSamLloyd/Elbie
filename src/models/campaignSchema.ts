import mongoose from 'mongoose'
const $Schema = mongoose.Schema

const Schema = new $Schema({
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

Schema.query.byCommand = function (Command):mongoose.Document {
  return this.where({$or: [{channel: Command.channel.id}, {server: Command.server.id, serverWide: true}]})
}
Schema.query.allActive = function ():mongoose.Document[] {
  return this.where({ active:true })
}

const Model = mongoose.model('Campaign', Schema)

export const Campaign = {Model, Schema}