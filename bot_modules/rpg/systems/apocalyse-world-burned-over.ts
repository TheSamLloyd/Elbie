import { GameSystem } from "./game";
import { ICharacter } from "../models/characterSchema";

class ApocalypseWorldBurnedOver extends GameSystem {
  defRoll='2d6'
  statAlias={
    'aggro': 'Aggro',
    'cool': 'Cool',
    'sharp': 'Sharp',
    'hard': 'Hard',
    'weird': 'Weird'
  }
  levelup=(character:ICharacter) => (false)
  mod(score:number):number{
    return score
  }
}

export default new ApocalypseWorldBurnedOver()