import { GameSystem, Score, ScoreList } from "./game";
import { ICharacter } from "../models/characterSchema";

class Masks extends GameSystem {
  name = 'Masks'
  defRoll = '2d6'
  stats = new ScoreList(
    new Score({name:'Danger', shortName:'dng'}),
    new Score({name: 'Freak', shortName:'frk'}),
    new Score({name: 'Savior', shortName:'sav'}),
    new Score({name: 'Superior',shortName:'sup'}),
    new Score({name: 'Mundane',shortName:'mun'})
  )
  skills=new ScoreList()
  levelup = (character:ICharacter): boolean => {
    return (character.exp >= 5);
  }
}

export default new Masks