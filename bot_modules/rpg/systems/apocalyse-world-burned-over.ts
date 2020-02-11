import { GameSystem, statSystem } from "./game";
import { ICharacter } from "../models/characterSchema";

class ApocalypseWorldBurnedOver extends GameSystem {
  name = 'Apocalypse World: Burned Over'
  defRoll='2d6'
  stats={
    'Aggro': new statSystem('Aggro','aggro'),
    'Cool': new statSystem('Cool','cool'),
    'Sharp': new statSystem('Sharp','sharp'),
    'Hard': new statSystem('Hard','hard'),
    'Weird': new statSystem('Weird','weird')
  }
  skills={}
  levelup=(character:ICharacter) => (false)
  mod(score:number):number{
    return score
  }
}

export default new ApocalypseWorldBurnedOver()