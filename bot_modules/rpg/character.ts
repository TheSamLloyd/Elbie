// dependencies

import { Document } from 'mongoose'
import { db } from './models/schema'
import { ICampaign } from './models/campaignSchema'
import { ICharacter, IAttribute } from './models/characterSchema'
import { IUser } from './models/userSchema'
import { IFunction } from '../module'
import { User } from './user'
import { ScoreList, Score } from './systems/game'

export class Character implements ICharacter {
  id: string
  name: string
  nickname: string | null
  user: IUser['id']
  dbUser: User | undefined
  campaign: ICampaign['id']
  scores: { stats: ScoreList, skills: ScoreList }
  attributes: IAttribute[]
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
    this.attributes = character.get('attributes')
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
  static get(userId: IUser["id"], campaignId: ICampaign['id'], cb: IFunction): void {
    db.Character.findOne().where({ user: userId, campaign: campaignId }).exec((err, char) => {
      if (char === null || err) {
        throw err || new Error(`Could not retrieved with given IDs: chrID:${userId} // campaignID:${campaignId}`)
      } else if (typeof char === typeof Document) {
        cb(new Character(char))
      }
    })
  }
  static getById(id: ICharacter['id'], cb: IFunction): void {
    db.Character.findById(id).exec((err, char: Document) => {
      if (char === null || err) {
        throw err || new Error(`Could not retrieved with given IDs: chrID:${id}`)
      } else if (typeof char === typeof Document) {
        cb(new Character(char))
      }
    })
  }
}