import { GameSystem, RollResults } from "./game";
import { Character } from "../character";
import { Die } from '../dice'

class BladesInTheDark extends GameSystem {
  name = 'Blades in the Dark'
  defRoll = '1d6'
  constructor() {
    super()
  }
  stats={}
  skills={}
  levelup = (character: Character): boolean => {
    return super.levelup(character)
  }
  roll = (input: string): RollResults[] => {
    let n: number = parseInt(input)
    let result: number = 0
    var critical = 0
    var outcome: string
    var dice: Die[]
    let rolled: number[] = []
    if (n <= 0) {
      rolled = new Die('2d6').roll()
      result = Math.min(...rolled)
    } else if (n > 0) {
      rolled = new Die(`${n}d6`).roll()
      result = Math.max(...rolled)
      critical = rolled.filter(die => die === 6).length - 1
    }
    if (critical) outcome = 'Critical success'
    else if (result === 6) outcome = 'Full success'
    else if (result >= 4) outcome = 'Partial success'
    else if (result >= 1) outcome = 'Bad outcome'
    else {
      outcome = "could not parse..."
    }
    let out = `${n}d6: ${outcome}`
    const output: RollResults = new RollResults({ iroll: out, dielist: rolled })
    return [output]
  }
}

export default new BladesInTheDark()