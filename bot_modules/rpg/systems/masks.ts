import { GameSystem, statSystem } from "./game";
import { ICharacter } from "../models/characterSchema";

class Masks extends GameSystem {
  name = 'Masks'
  defRoll = '2d6'
  stats = {
    'Danger': new statSystem('Danger','dng'),
    'Freak': new statSystem('Freak','frk'),
    'Savior': new statSystem('Savior','sav'),
    'Superior': new statSystem('Superior','sup'),
    'Mundane': new statSystem('Mundane','mun')
  }
  skills={}
  levelup = (character:ICharacter): boolean => {
    return (character.exp >= 5);
  }
}

export default new Masks