import { GameSystem, ScoreList} from './game'
import { ICharacter } from '../models/characterSchema'
import { Character } from '../character'
import {RollResults} from './game'

class nullGame extends GameSystem {
    constructor() {
        super()
    }
    skills= new ScoreList()
    stats= new ScoreList()
    name = 'nullGame'
    defRoll = '2d6'
    levelup(character: ICharacter): boolean { return (character.exp >= character.level + 6) }
    roll(char:Character|null, str:string):RollResults[]{
        return super.roll(char,str)
    }
}

export default new nullGame()