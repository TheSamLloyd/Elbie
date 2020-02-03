import { GameSystem, RollResults } from "./game";
import { Command } from "../../../objects/command";
import common from '../../common'
import { Character } from "../character";

class BladesInTheDark extends GameSystem {
  name = 'Blades in the Dark'
  defRoll = '1d6'
  statAlias = {
    'dng': 'Danger',
    'frk': 'Freak',
    'sav': 'Savior',
    'sup': 'Superior',
    'mun': 'Mundane'
  }
  constructor() {
    super()
  }
  levelup = (character: Character): boolean => {
    return super.levelup(character)
  }
  roll = (input: string): RollResults[] => {
    let n: number = parseInt(input)
    var out: string
    let result: number = 0
    var critical = 0
    var outcome: string
    var dice: number[] = []
    if (n <= 0) {
      dice = [common.randInt(1, 6), common.randInt(1, 6)]
      result = Math.min(...dice)
      out = `${n}d6: ${dice}]: ${result}`
    } else if (n > 0) {
      for (var i = 0; i < n; i++) {
        dice.push(common['randInt'](1, 6))
      }
    }
    result = Math.max(...dice)
    critical = dice.filter(die => die === 6).length
    out = `${n}d6: ${dice}: ${result}`
    critical -= 1
    if (critical) outcome = 'Critical success'
    else if (result === 6) outcome = 'Full success'
    else if (result >= 4) outcome = 'Partial success'
    else if (result >= 1) outcome = 'Bad outcome'
    else {
      outcome = "could not parse..."
    }
    out = `${out} - ${outcome}`
    const output: RollResults = new RollResults({iroll:`${n}d6`, dielist:dice })
    return [output]
  }
}

export default new BladesInTheDark()