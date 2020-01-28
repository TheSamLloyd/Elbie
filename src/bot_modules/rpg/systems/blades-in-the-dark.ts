import { GameSystem } from "./game";
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
  constructor(){
    super()
  }
  levelup = (character:Character):boolean => {
    return super.levelup(character)
  }
  roll = (input:string): string => {
    let n: number = parseInt(input)
    var out
    let result: number = 0
    var critical = 0
    var outcome
    if (n <= 0) {
      var dice1 = common['randInt'](1, 6)
      var dice2 = common['randInt'](1, 6)
      result = Math.min(dice1, dice2)
      out = `${n}d6: [${dice1}, ${dice2}]: ${result}`
    } else if (n > 0) {
      var dice = []
      for (var i = 0; i < n; i++) {
        dice.push(common['randInt'](1, 6))
      }
      result = Math.max(...dice)
      critical = dice.filter(die => die === 6).length
      out = `${n}d6: ${dice}: ${result}`
      critical -= 1
      if (critical) outcome = 'Critical success'
      else if (result === 6) outcome = 'Full success'
      else if (result >= 4) outcome = 'Partial success'
      else if (result >= 1) outcome = 'Bad outcome'
      else if (isNaN(n)) {
        return 'Malformed roll.'
      }
      out = `${out} - ${outcome}`
      return out
    }
    return ""
  }
  rollFormat(cmd:Command){
    cmd.reply(this.roll(cmd.argument))    
  }
}

export default new BladesInTheDark()