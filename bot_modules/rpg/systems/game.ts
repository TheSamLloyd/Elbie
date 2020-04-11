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
    shortName: string
    ranks?: number
    stat?: Score
    constructor({ name, shortName, ranks, stat }: { name: string; shortName?: string; ranks?: number; stat?: Score }) {
        this.name = name
        this.shortName = shortName || this.name.replace(/\W/, '').toLowerCase()
        this.ranks = ranks
        this.stat = stat
    }
}

interface IScoreList {
    [skillName: string]: Score
}
export class ScoreList extends Array<Score>{
    constructor(...scores: Score[]) {
        super(...scores)
    }
    get = (name: string): Score | null => {
        name = name.toLowerCase()
        let scores = this.filter((val: Score) => val.name.toLowerCase() === name || val?.shortName?.toLowerCase() === name)
        if (scores.length == 0) {
            return null
        }
        else {
            return scores[0]
        }
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
            try {
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
            }
            catch {
                results.push(new RollResults({ iroll: "Malformed roll.", dielist: [0], total: "" }))
            }
        })
        return results
    }
    mod(score: number): number {
        return score
    }
    levelup(character: Character): boolean {
        return false
    }
    skillRoll = (char: Character | null, skill: string): Die => {
        console.log('in the skill roll function')
        if (!char) {
            return new Die(skill)
        }
        let sc: Score | null = char.skills.get(skill) || char.stats.get(skill)
        console.log(`sc: ${sc?.name}`)
        if (sc != null) {
            let ranks: number = sc?.ranks || 0
            let mod: number = this.mod(sc?.stat?.ranks || 0) || 0
            console.log(ranks, mod, sc.name)
            return new Die((ranks + mod).toString())
        }
        else {
            try {
                return new Die(skill)
            }
            catch{
                throw new ReferenceError('No skill by that name.')
            }
        }
    }
}

