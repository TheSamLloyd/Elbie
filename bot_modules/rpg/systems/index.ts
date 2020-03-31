import ApocalypseWorldBurnedOver from './apocalyse-world-burned-over'
import Masks from './masks'
import DungeonWorld from './dungeon-world'
import DnD35 from './dungeons-and-dragons-3-5e'
import BladesintheDark from './blades-in-the-dark'
import { GameSystem } from './game'
import { db } from '../models/schema'
import { ISystem } from '../models/systemSchema'

interface gameListObject {
    [index: string]: GameSystem
}
class gameList {
    listObject: gameListObject = {}
    constructor(gameArray: GameSystem[]) {
        gameArray.forEach(game => {
            this.listObject[game.name] = game
        })
        console.log(`gameList constructed with ${this.listObject.length} systems.`)
    }
    get = (name: string): GameSystem => {
        return this.listObject[name]
    }
    retrieve = async (id: ISystem["_id"]): Promise<GameSystem> => {
        let system: ISystem | null = await db.System.findById(id).exec()
        return new Promise((resolve, reject) => {
            if (system === null) {
                reject(new Error(`No system found with id ${id}`))
            }
            else {
                let name: string = system.get('name')
                let game: GameSystem = this.get(name)
                console.log(`system found -- name "${name}"`)
                resolve(game)
            }
        })
    }
}

export default new gameList([ApocalypseWorldBurnedOver, Masks, DungeonWorld, DnD35, BladesintheDark])