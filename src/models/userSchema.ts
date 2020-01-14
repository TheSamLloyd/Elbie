import mongoose from 'mongoose'

var $Schema = mongoose.Schema

var Schema = new $Schema({
  name: {
    type: String,
    required: true
  },
  _id: {
    type: String,
    required: true
  },
  characters: {
    type: [$Schema.Types.ObjectId],
    ref: 'Character'
  },
  dm: {
    type: [$Schema.Types.ObjectId],
    ref: 'Campaign'
  }
})
const Model = mongoose.model('User', Schema)
export const User = {Schema, Model}
