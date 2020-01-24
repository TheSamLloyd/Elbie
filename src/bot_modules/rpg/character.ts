// dependencies
const audio = require('../audio') || false

const DB_URI = process.env.MONGODB_URI || ""
import mongoose, { Document } from 'mongoose'
import { db } from './models/schema'
import { ICampaign } from './models/campaignSchema'
import { ICharacter } from './models/characterSchema'
import { IUser } from './models/userSchema'
mongoose.set('useNewUrlParser', true)
mongoose.set('useCreateIndex', true)
mongoose.set('useUnifiedTopology', true)

mongoose.connect(DB_URI).then(
  () => {
    console.log('DB connection ready')
  },
  err => { console.log(`DB connection failed... \n${err}`) }
)

export class Character implements ICharacter {
  name: string
  nickname: string | null
  user: IUser['id']
  campaign: ICampaign['id']
  scores: { stats: object, skills: object }
  attributes: any[]
  inventory: string[]
  HP: { current: number, maxHP: number }
  level: number
  exp: number
  alive: boolean
  desc: string
  theme: string | null
  stats: object
  skills: object
  constructor(character: Document) {
    this.user = character.get('user')
    this.name = character.get('name')
    this.nickname = character.get('nickname')
    this.campaign = character.get('campaign')
    this.scores = character.get('scores')
    this.attributes = character.get('attributes')
    this.inventory = character.get('inventory')
    this.HP = character.get('HP')
    this.level = character.get('level')
    this.exp = character.get('exp')
    this.alive = character.get('alive')
    this.desc = character.get('desc')
    this.theme = character.get('theme')
    this.stats = this.scores.stats
    this.skills = this.scores.skills
  }
  static async get(userId: IUser["id"], campaignId: ICampaign['id']): Promise<Character|undefined> {
    let pChar = await db.Character.findOne().where({ user: userId, campaign: campaignId }).exec((err, char) => {
      return char
    })
    if (pChar === null) {
      throw new Error(`Could not retrieved with given IDs: chrID:${userId} // campaignID:${campaignId}`)
    } else if (typeof pChar === typeof Document) {
      return new Character(pChar)
    }
  }
  getSystem(this: Character) {

  }
}