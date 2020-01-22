import { GameSystem } from "./game"
import { ICharacter } from "../../../models/characterSchema"

class DungeonWorld extends GameSystem {
  constructor(){
    super()
  }
  defRoll = '2d6'
  statAlias = {
    'str': 'Strength',
    'con': 'Constitution',
    'dex': 'Dexterity',
    'int': 'Intelligence',
    'wis': 'Wisdom',
    'cha': 'Charisma'
  }
  levelup(character:ICharacter):boolean {return (character.exp >= character.level + 6)}
  mod(score:number):number{
    let val = 0
    if (score >= 1 && score <= 3) val = -3
    else if (score >= 4 && score <= 5) val = -2
    else if (score >= 6 && score <= 8) val = -1
    else if (score >= 9 && score <= 12) val = 0
    else if (score >= 13 && score <= 15) val = 1
    else if (score >= 16 && score <= 17) val = 2
    else if (score === 18) val = 3
    return val
  }
}

export default new DungeonWorld
