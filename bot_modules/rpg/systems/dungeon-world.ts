import { GameSystem, skillSystem, statSystem, ScoreList } from "./game"
import { ICharacter } from "../models/characterSchema"

class DungeonWorld extends GameSystem {
  constructor(){
    super()
  }
  name = 'Dungeon World'
  defRoll = '2d6'
  stats:ScoreList = {
    'strength': new statSystem('Strength','str'),
    'dexterity': new statSystem('Dexterity','dex'),
    'constitution': new statSystem('Constitution','con'),
    'intelligence': new statSystem('Intelligence','int'),
    'wisdom': new statSystem('Wisdom','wis'),
    'charisma': new statSystem('Charisma','cha'),
  }
  skills:ScoreList={}
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
