import ApocalypseWorldBurnedOver from './apocalyse-world-burned-over'
import Masks from './masks'
import DungeonWorld from './dungeon-world'
import DnD35 from './dungeons-and-dragons-3-5e'
import { GameSystem } from './game'
import { db } from '../models/schema'
import {ISystem} from '../models/systemSchema'
import {Document} from 'mongoose'
import { IFunction } from '../../module'

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
    retrieve(id: ISystem["_id"], cb: IFunction): void {
        db.System.findById(id).exec((err, system: Document) => {
            if (err || !system) {
                console.error(err || `No system found with id ${id}`)
            }
            else {
                cb(system.get('name'))
            }
        })
    }
}

export default new gameList([ApocalypseWorldBurnedOver, Masks, DungeonWorld, DnD35])