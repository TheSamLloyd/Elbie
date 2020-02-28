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
class Score {
    name: string
    shortName?: string
    constructor(name: string, shortName?: string) {
        this.name = name
        this.shortName = shortName
    }
}
export class Skill extends Score {
    stat?: string
    ranks?: number
    constructor(name: string, ranks?: number, stat?: string) {
        super(name)
        this.ranks = ranks
        this.stat = stat
    }
}
export class Stat extends Score {
    shortName?: string
    constructor(name: string, shortName?: string) {
        super(name, shortName)
    }
}

interface IScoreList {
    [skillName: string]: Score
}
export class ScoreList implements IScoreList {
    [k: string]: Score
    constructor(scores: Score[]) {
        scores.forEach((s: Score) => {
            this[s.name] = s
        })
    }
    getByName = (name: string): Score | undefined => {
        if (this[name]) return this[name]
        else {
            let k:object
            Object.keys(this).map((s: string) => this[s]).filter((score: Score) => {
                score.shortName
            }).forEach((sn:Score)=>{
                if (sn.shortName==name) return sn
            })

        }
    }
}
export abstract class GameSystem implements IGameSystem {
    defRoll!: string
    name!: string
    abstract skills: ScoreList
    abstract stats: ScoreList
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
            return this.roll(this.defRoll + "+" + char.skills[skill].ranks + "+" + this.mod(char.stats[skill]))
        }
        else if (this.stats[skill]) {
            return this.roll(this.defRoll + "+" + this.mod(char.stats[skill]))
        }
        else {
            return this.roll("")
        }
    }
}

