var mongoose = require('mongoose')
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
var Object = mongoose.model('User', Schema)
module.exports = {Schema, Object}
