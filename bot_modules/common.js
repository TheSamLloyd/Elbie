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
    var total = 0
    for (var i = 0; i < Array.length; i++) {
      total += parseInt(Array[i])
    }
    return total
  },
  typed (arg) {
    if (isNaN(parseFloat(arg))) {
      return arg
    } else if (Math.floor(parseFloat(arg)) == parseFloat(arg)) {
      return parseInt(arg)
    } else return parseFloat(arg)
  },
  orDef (val, def) {
    return (val || def)
  }
}
module.exports = common
