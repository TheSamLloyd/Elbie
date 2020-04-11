// dependencies

import { Document } from 'mongoose'
import { db } from './models/schema'
import { ICampaign } from './models/campaignSchema'
import { ICharacter, IAttribute } from './models/characterSchema'
import { IUser } from './models/userSchema'
import { IFunction } from '../module'
import { User } from './user'
import { ScoreList, Score } from './systems/game'

class Attribute implements IAttribute {
  key:string
  value:string
  display:boolean
  constructor(obj:IAttribute){
    this.key=obj.key
    this.value=obj.value.toString()
    this.display = obj?.display || true
  }
}

export class Character implements ICharacter {
  id: string
  name: string
  nickname: string | null
  user: IUser['id']
  dbUser: User | undefined
  campaign: ICampaign['id']
  scores: { stats: ScoreList, skills: ScoreList }
  attributes: Attribute[]
  inventory: string[]
  HP: { current: number, maxHP: number }
  level: number
  exp: number
  alive: boolean
  desc: string
  theme: string | null
  stats: ScoreList
  skills: ScoreList
  aviURL: string | null
  constructor(character: Document) {
    this.id = character.id
    this.user = character.get('user')
    this.name = character.get('name')
    this.nickname = character.get('nickname')
    this.campaign = character.get('campaign')
    let scores = character.get('scores')
    let stats: Map<string, any> = scores['stats']
    this.attributes = character.get('attributes').map((attribute:IAttribute)=>{return new Attribute(attribute)})
    this.inventory = character.get('inventory')
    this.HP = character.get('HP')
    this.level = character.get('level')
    this.exp = character.get('exp')
    this.alive = character.get('alive')
    this.desc = character.get('desc')
    this.theme = character.get('theme')
    this.stats = new ScoreList(...Array.from(stats.keys()).map((name: string) => new Score({ name: name, ranks: stats.get(name) })))
    this.skills = new ScoreList(...Array.from(stats.keys()).map((name: string) => new Score({ name: name, ranks: stats.get(name) })))
    this.scores = { stats: this.stats, skills: this.skills }
    this.aviURL = character.get('aviURL')
    User.get(this.user as string, (user: User) => {
      this.dbUser = user
    })
  }
  static async get(userId: IUser["id"], campaignId: ICampaign['id']): Promise<Character | null> {
    let char = await db.Character.findOne().where({ user: userId, campaign: campaignId })
    if (char === null) {
      console.log(`Could not retrieved with given IDs: chrID:${userId} // campaignID:${campaignId}`)
      return null
    } else if (char instanceof Document) {
      return new Character(char)
    } else {
      return null
    }
  }
  static async getById(id: ICharacter['id'], cb: IFunction): Promise<Character | null> {
    let char = await db.Character.findById(id)
    if (char === null) {
      console.log(`Could not retrieved with given IDs: chrID:${id}`)
      return null
    } else if (typeof char === typeof Document) {
      return new Character(char)
    }
    else {
      return null
    }
  }
}