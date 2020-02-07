import { Die, types } from "../dice"
import { Character } from "../character"

interface IGameSystem {
    readonly name: string
    readonly defRoll: string
    mod: (score: number) => number
    levelup: (chr: Character) => boolean
}
export class RollResults {
    readonly iroll: string
    readonly dielist: number[]
    readonly total: number | string | undefined
    constructor(res: { iroll: string, dielist: number[], total?: number | string }) {
        this.iroll = res.iroll
        this.dielist = res.dielist
        this.total = (res.total || 0) || Die.sum(res.dielist)
    }
}
export class skillSystem {
    name: string
    stat?: string
    ranks?: number
    constructor(name: string, ranks?: number, stat?: string) {
        this.name = name
        this.ranks = ranks
        this.stat = stat
    }
}
export interface ScoreList {
    [index: string]: skillSystem|statSystem
}
export class statSystem{
    name:string
    shortName?:string
    constructor(name:string, shortname?:string){
        this.name=name
        this.shortName=shortname
    }
}
export abstract class GameSystem implements IGameSystem {
    defRoll!: string
    name!: string
    skills: ScoreList = {}
    stats: ScoreList = {}
    roll(str: string): RollResults[] {
        if (str === "") str = this.defRoll
        let rolls: string[] = str.split(/\s*,\s*/)
        let results: RollResults[] = []
        rolls.forEach((iroll: string) => {
            let dielist: number[] = []
            iroll = iroll.replace('-', '+-').replace('++', '+')
            let tempIroll = iroll.split("+")
            tempIroll.forEach((die: string) => {
                const k = new Die(die)
                const z = new Die(this.defRoll)
                if (tempIroll.length == 1 && k.type == types['modifier']) {
                    dielist = dielist.concat(z.roll(), k.roll())
                    iroll = this.defRoll + "+" + iroll
                }
                else { dielist = dielist.concat(k.roll()) }
            })
            results.push(new RollResults({ iroll, dielist }))
        })
        console.log(results)
        return results
    }
    mod(score: number): number {
        return score
    }
    levelup(character: Character): boolean {
        return false
    }
    skillRoll = (char: Character, skill: string): RollResults[] => {
        if (this.skills[skill]) {
            return this.roll(this.defRoll + "+" + char.skills[skill] + "+" + this.skills[skill])
        }
        else {
            return this.roll("")
        }
    }
}

