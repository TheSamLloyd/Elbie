var DnD35 = {
  defRoll: '1d20',
  statAlias: {
    'str': 'Strength',
    'con': 'Constitution',
    'dex': 'Dexterity',
    'int': 'Intelligence',
    'wis': 'Wisdom',
    'cha': 'Charisma'
  },
  levelup: (character) => false,
  mod: function (score) {
    var val = Math.floor(score / 2) - 5
    return val
  }
}
module.exports = DnD35
