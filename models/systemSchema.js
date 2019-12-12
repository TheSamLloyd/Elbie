var mongoose = require('mongoose')
var Schema = mongoose.Schema

var SystemSchema = new Schema({
  name: {
    type: String,
    required: true
  }
})
SystemSchema.virtual('path').get(function () {
  return `../bot_modules/rpg/${this.name.replace(/\W+/g, '-').toLowerCase()}.js`
})

module.exports = SystemSchema
