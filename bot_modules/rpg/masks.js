var Masks = {
  defRoll: '2d6',
  statAlias: {
    'dng': 'Danger',
    'frk': 'Freak',
    'sav': 'Savior',
    'sup': 'Superior',
    'mun': 'Mundane'
  },
  levelup: (character) => (character.exp >= 5),
  mod: function (score) {
    return score
  }
}
module.exports = Masks
