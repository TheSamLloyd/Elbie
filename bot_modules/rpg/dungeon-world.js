var DungeonWorld = {
  defRoll: '2d6',
  statAlias: {
    'str': 'Strength',
    'con': 'Constitution',
    'dex': 'Dexterity',
    'int': 'Intelligence',
    'wis': 'Wisdom',
    'cha': 'Charisma'
  },
  levelup: (character) => (character.exp >= character.level + 6),
  mod: function (score) {
    var val
    if (score >= 1 && score <= 3) val = -3
    else if (score >= 4 && score <= 5) val = -2
    else if (score >= 6 && score <= 8) val = -1
    else if (score >= 9 && score <= 12) val = 0
    else if (score >= 13 && score <= 15) val = 1
    else if (score >= 16 && score <= 17) val = 2
    else if (score === 18) val = 3
    else val = 0
    return val
  }
}
module.exports = DungeonWorld
