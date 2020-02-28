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
export class Score {
    name: string
    shortName?: string
    ranks?: number
    stat?: Score
    constructor({ name, shortName, ranks, stat }: { name: string; shortName?: string; ranks?: number; stat?: Score }) {
        this.name = name
        this.shortName = shortName
        this.ranks = ranks
        this.stat = stat
    }
}

interface IScoreList {
    [skillName: string]: Score
}
export class ScoreList implements IScoreList {
    [scoreName: string]: Score
    constructor(scores: Score[]) {
        scores.forEach((s: Score) => {
            this[s.name] = s
        })
        console.log(this)
    }
    getByName = (name: string): Score => {
        if (this[name]) return this[name]
        else {
            let k: object
            Object.keys(this).map((s: string) => this[s]).filter((score: Score) => {
                score.shortName
            }).forEach((sn: Score) => {
                if (sn.shortName == name) return sn
            })

        }
        throw new ReferenceError("No skill by that name")
    }
    getAllNames = (): string[] => {
        let arr1: string[] = Object.keys(this).map((sc: string) => this[sc].name)
        let arr2: string[] = Object.keys(this).filter((sc: string) => this[sc].shortName).map((sc: string) => this[sc].shortName || "")
        return arr1.concat(arr2).filter((st: string) => st)
    }
}
export abstract class GameSystem implements IGameSystem {
    defRoll!: string
    name!: string
    abstract skills: ScoreList
    abstract stats: ScoreList
    roll(char: Character | null, str: string): RollResults[] {
        if (str === "") str = this.defRoll
        let rolls: string[] = str.split(/\s*,\s*/)
        let results: RollResults[] = []
        rolls.forEach((iroll: string) => {
            let dielist: number[] = []
            iroll = iroll.replace('-', '+-').replace('++', '+')
            let tempIroll = iroll.split("+")
            tempIroll.forEach((die: string) => {
                const k = this.skillRoll(char, die)
                const z = new Die(this.defRoll)
                if (tempIroll.length == 1 && k.type == types['modifier']) {
                    dielist = dielist.concat(z.roll(), k.roll())
                    iroll = this.defRoll + "+" + iroll
                }
                else { dielist = dielist.concat(k.roll()) }

            }
            )
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
    skillRoll = (char: Character | null, skill: string): Die => {
        console.log(this.skills.getAllNames())
        console.log(this.stats.getAllNames())
        if (!char || !(skill in this.skills.getAllNames() || skill in this.stats.getAllNames())) {
            return new Die(skill)
        }
        let sc: Score = char.skills.getByName(skill) || char.stats.getByName(skill)
        console.log(sc)
        let cSkill = char.skills.getByName(sc.name) || char.stats.getByName(sc.name)
        let ranks: number = cSkill?.ranks || 0
        let mod = this.mod(cSkill?.stat?.ranks || 0) || 0
        return new Die((ranks + mod).toString())
    }
}

