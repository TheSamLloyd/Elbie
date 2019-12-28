var mongoose = require('mongoose')
var $Schema = mongoose.Schema

var Schema = new $Schema({
  name: {
    type: String,
    required: true
  }
})
Schema.virtual('path').get(function () {
  return `../bot_modules/rpg/${this.name.replace(/\W+/g, '-').toLowerCase()}.js`
})

var Object = mongoose.model('System', Schema)

module.exports = {Schema, Object}
