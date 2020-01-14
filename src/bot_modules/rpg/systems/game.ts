import { Command } from "../../../objects/command"
import { Die } from "../dice"

export abstract class GameSystem {
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
        output.forEach((roll,i)=>{
            text += output[i]['roll'] + ': ' + output[i]['dielist'] + '=**' + output[i]['total'] + '**\n'
        })
        command.reply(text.trim())
    }
    mod(score: number): number {
        return score
    }
    abstract levelup<T>(character:T): boolean

}