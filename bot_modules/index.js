const fs = require('fs')
let modules = []
fs
  .readdirSync(__dirname)
  .filter(file => file !== 'index.js')
  .forEach(file => {
    modules.push(require(`./${file}`))
  })
console.log(modules)
module.exports = modules
