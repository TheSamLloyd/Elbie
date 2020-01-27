// dependencies
const audio = require('../audio') || false

const DB_URI = process.env.MONGODB_URI || ""
import mongoose, { Document } from 'mongoose'
import { db } from './models/schema'
import { ICampaign } from './models/campaignSchema'
import { ICharacter } from './models/characterSchema'
import { IUser } from './models/userSchema'
import { IFunction } from '../module'
import { User } from 'discord.js'
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
  id:string
  name: string
  nickname: string | null
  user: IUser['id']|User
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
    this.id=character.id
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
    db.User.findById(this.user).exec((err,user:Document)=>{
      if (err) {
        throw new Error('Issue retrieving user info.')
      }
      else {
        this.user=new User(
      }
    })
  }
  static get(userId: IUser["id"], campaignId: ICampaign['id'], cb: IFunction): void {
    db.Character.findOne().where({ user: userId, campaign: campaignId }).exec((err, char) => {
      if (char === null || err) {
        throw err || new Error(`Could not retrieved with given IDs: chrID:${userId} // campaignID:${campaignId}`)
      } else if (typeof char === typeof Document) {
        cb(new Character(char))
      }
    })
  }
  static getById(id:ICharacter['id'], cb:IFunction):void{
    db.Character.findById(id).exec((err,char:Document)=>{
      if (char === null || err) {
        throw err || new Error(`Could not retrieved with given IDs: chrID:${id}`)
      } else if (typeof char === typeof Document) {
        cb(new Character(char))
      }
    })
  }
}