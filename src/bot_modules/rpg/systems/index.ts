import ApocalypseWorldBurnedOver from './apocalyse-world-burned-over'
import Masks from './masks'
import DungeonWorld from './dungeon-world'
import DnD35 from './dungeons-and-dragons-3-5e'
import { GameSystem } from './game'

interface gameListObject{
    [index:string]:GameSystem
}
class gameList {
    listObject:gameListObject={}
    constructor(gameArray:GameSystem[]){
        gameArray.forEach(game=>{
            this.listObject[game.name]=game
        })
    }
    get(name:string):GameSystem{
        return this.listObject[name]
    }
}

export default new gameList([ApocalypseWorldBurnedOver, Masks, DungeonWorld, DnD35])