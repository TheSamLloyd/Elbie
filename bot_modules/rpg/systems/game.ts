import { Command } from "../../../objects/command"
import { Die } from "../dice"
import { ICharacter } from "../models/characterSchema"
import { db } from '../models/schema'

interface IGameSystem {
    readonly name: string
    readonly defRoll: string
    mod: (score: number) => number
    levelup: (chr: ICharacter) => boolean
}
class RollResults {
    readonly iroll:string
    readonly dielist: number[]
    readonly total: number
    constructor(res:{iroll:string, dielist:number[]}){        
    this.iroll=res.iroll
    this.dielist=res.dielist
    this.total=Die.sum(res.dielist)
    }
}

export abstract class GameSystem implements IGameSystem {
    defRoll!: string
    name!: string
    static roll(str:string): RollResults[] {
        let rolls: string[] = str.split(/\s*,\s*/)
        let results:RollResults[] = []
        rolls.forEach((iroll: string) => {
            let dielist: number[] = []
            iroll = iroll.replace('-', '+-').replace('++', '+')
            iroll.split('+').forEach((die: string) => {
                const k = new Die(die)
                dielist = dielist.concat(k.roll())
            })
            results.push(new RollResults({iroll, dielist}))
        })
        console.log(results)
        return results
    }
    static rollFormat(command: Command): void {
        const output: RollResults[] = GameSystem.roll(command.argument)
        let text: string = ''
        output.forEach((roll) => {
            text += roll.iroll + ': ' + roll.dielist + '=**' + roll.total + '**\n'
        })
        command.reply(text.trim())
    }
    mod(score: number): number {
        return score
    }
    levelup(character: ICharacter): boolean{
        return false
    }

}