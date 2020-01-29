import { GameSystem } from "./game";
import { ICharacter } from "../models/characterSchema";

class Masks extends GameSystem {
  name = 'Masks'
  defRoll = '2d6'
  statAlias = {
    'dng': 'Danger',
    'frk': 'Freak',
    'sav': 'Savior',
    'sup': 'Superior',
    'mun': 'Mundane'
  }
  levelup = (character:ICharacter): boolean => {
    return (character.exp >= 5);
  }
}

export default new Masks