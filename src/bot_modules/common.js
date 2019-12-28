const name = 'common'
const desc = 'Common functions for use in other modules'
// common commands for use in other elbie modules
const common = {
  randInt (a, b) {
    var out
    if (b) {
      out = Math.floor(Math.random() * (b - a + 1)) + a
    } else {
      out = Math.floor(Math.random() * (a + 1))
    }
    return out
  },
  sum (Array) {
    var total = Array.reduce(function (total, value) { return total + value })
    return total
  },
  typed (arg) {
    if (isNaN(parseFloat(arg))) {
      return arg
    } else if (Math.floor(parseFloat(arg)) === parseFloat(arg)) {
      return parseInt(arg)
    } else return parseFloat(arg)
  },
  orDef (val, def) {
    return (val || def)
  },
  caps (string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
  },
  notNull (array) {
    return array.filter(val => (val === 0 || val))
  }
}
const commands = {}
module.exports = { name, desc, common, commands }
