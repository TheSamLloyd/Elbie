import { GameSystem, Score, ScoreList } from "./game";
import { ICharacter } from "../models/characterSchema";

class ApocalypseWorldBurnedOver extends GameSystem {
  name = 'Apocalypse World: Burned Over'
  defRoll='2d6'
  stats=new ScoreList(
    new Score({name:'Aggro',shortName:'aggro'}),
    new Score({name:'Cool', shortName:'cool'}),
    new Score({name:'Sharp',shortName:'sharp'}),
    new Score({name:'Hard',shortName:'hard'}),
    new Score({name:'Weird',shortName:'weird'})
  )
  skills=new ScoreList()
  levelup=(character:ICharacter) => (false)
  mod(score:number):number{
    return score
  }
  constructor(){
    super()
  }
}

export default new ApocalypseWorldBurnedOver()