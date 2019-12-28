import fs from 'fs'
export let modules = []
fs
  .readdirSync(__dirname)
  .filter(file => file !== 'index.js')
  .forEach(file => {
    modules.push(require(`./${file}`))
  })