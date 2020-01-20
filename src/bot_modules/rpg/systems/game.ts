import { Command } from "../../../objects/command"
import { Die } from "../dice"
import { ICharacter } from "../../../models/characterSchema"
import { db } from '../../../models/schema'

export abstract class GameSystem extends db.System {
    readonly name: string
    readonly defRoll: string
    roll(cmd: Command): object[] {
        let rolls: string[] = cmd.argument.split(/\s*,\s*/)
        let results = []
        rolls.forEach((iroll:string) => {
            let dielist: number[]
            iroll = iroll.replace('-', '+-').replace('++', '+')
            iroll.split('+').forEach((die: string) => {
                let k:Die 
                try {
                    k = new Die(die)
                } 
                catch (err){
                    console.error(err)
                    cmd.reply('Malformed roll.')
                }
                dielist = dielist.concat(k.roll())
            })
            results.push({ roll: iroll, dielist, total:Die.sum(dielist) })
        })
        console.log(results)
        return results
    }
    rollFormat(command: Command): void {
        const output:object[] = this.roll(command)
        let text:string = ''
        output.forEach((roll)=>{
            text += roll['roll'] + ': ' + roll['dielist'] + '=**' + roll['total'] + '**\n'
        })
        command.reply(text.trim())
    }
    mod(score: number): number {
        return score
    }
    abstract levelup(character:ICharacter): boolean

}