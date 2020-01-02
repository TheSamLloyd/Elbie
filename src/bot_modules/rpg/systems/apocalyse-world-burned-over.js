var ApocalypseWorldBurnedOver = {
  defRoll: '2d6',
  statAlias: {
    'aggro': 'Aggro',
    'cool': 'Cool',
    'sharp': 'Sharp',
    'hard': 'Hard',
    'weird': 'Weird'
  },
  levelup: (character) => (false),
  mod: function (score) {
    return score
  }
}
module.exports = ApocalypseWorldBurnedOver
