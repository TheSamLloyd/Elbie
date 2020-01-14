import { GameSystem } from "./game";

export class Masks extends GameSystem {
  name = 'Masks'
  defRoll = '2d6'
  statAlias = {
    'dng': 'Danger',
    'frk': 'Freak',
    'sav': 'Savior',
    'sup': 'Superior',
    'mun': 'Mundane'
  }
  levelup = (character): boolean => (character.exp >= 5)
}