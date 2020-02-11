import { GameSystem } from './game'
import { ICharacter } from '../models/characterSchema'
import {RollResults} from './game'

class nullGame extends GameSystem {
    constructor() {
        super()
    }
    skills={}
    stats={}
    name = 'nullGame'
    defRoll = '2d6'
    levelup(character: ICharacter): boolean { return (character.exp >= character.level + 6) }
    roll(str:string):RollResults[]{
        return super.roll(str)
    }
}

export default new nullGame()