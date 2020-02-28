import { GameSystem, Skill, Stat, ScoreList } from "./game"
import { ICharacter } from "../models/characterSchema"

class DungeonWorld extends GameSystem {
  constructor() {
    super()
  }
  name = 'Dungeon World'
  defRoll = '2d6'
  stats = new ScoreList([new Stat('Strength', 'str'),
  new Stat('Dexterity', 'dex'),
  new Stat('Constitution', 'con'),
  new Stat('Intelligence', 'int'),
  new Stat('Wisdom', 'wis'),
  new Stat('Charisma', 'cha')])

  skills = new ScoreList([])
  levelup(character: ICharacter): boolean { return (character.exp >= character.level + 6) }
  mod(score: number): number {
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
