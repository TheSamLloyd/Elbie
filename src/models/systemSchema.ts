import mongoose from 'mongoose'
const $Schema = mongoose.Schema

const Schema = new $Schema({
  name: {
    type: String,
    required: true
  }
})
Schema.virtual('path').get(function () {
  return `../bot_modules/rpg/${this.name.replace(/\W+/g, '-').toLowerCase()}.js`
})

var Model = mongoose.model('System', Schema)

export const System = {Schema, Model}
