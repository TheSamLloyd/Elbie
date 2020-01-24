import mongoose, { Schema, Document } from 'mongoose'
import { ICampaign } from './campaignSchema'
import { IUser } from './userSchema'

interface ISkills {
  [skill: string]: any;
}

interface IStats {
  [stat: string]: any;
}

interface IAttribute {
  key:string
  value:string
  display:boolean
}

export interface ICharacter {
  name: string
  nickname: string | null
  user: IUser['id']
  campaign: ICampaign['id']
  scores: { stats: IStats, skills: ISkills }
  attributes: IAttribute[]
  inventory: string[]
  HP: { current: number, maxHP: number }
  level: number
  exp: number
  alive: boolean
  desc: string
  theme: string | null
  stats: object
  skills: any
}

const CharacterSchema: Schema = new Schema({
  name: {
    type: String,
    required: true
  },
  nickname: {
    type: String
  },
  user: {
    type: String,
    required: true,
    ref: 'User',
    index: true
  },
  campaign: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Campaign'
  },
  scores: {
    stats: {
      type: Map,
      of: Number
    },
    skills: {
      type: Map,
      of: Number
    }
  },
  attributes: {
    type: Schema.Types.Mixed
  },
  inventory: [],
  HP: {
    required: false,
    current: {
      type: Number
    },
    maxHP: {
      type: Number,
      min: [1, 'Max HP cannot be less than 1.']
    }
  },
  level: Number,
  exp: {
    type: Number,
    default: 0,
    min: 0
  },
  alive: { type: Boolean, default: true },
  desc: {
    type: String
  },
  theme: {
    type: String
  }
})

CharacterSchema.query.byCampaign = function (campaignID: ICampaign["id"]): ICharacter[] {
  return this.where({ campaign: campaignID })
}
CharacterSchema.query.byCampaignAndUserId = function (campaignID: ICampaign["id"], userID: IUser["id"]): ICharacter {
  return this.where({ campaign: campaignID, user: userID })
}
CharacterSchema.query.byName = function (name: string): ICharacter[] {
  return this.where({ $or: [{ name: name }, { nickname: name }] })
}
CharacterSchema.query.byCampaignAndName = function (campaignID: ICampaign["id"], name: string): ICharacter {
  return this.where({ campaign: campaignID, $or: [{ name: name }, { nickname: name }] })
}

CharacterSchema.pre('validate', function (next) {
  if (this.get('HP.current') > this.get('HP.maxHP')) {
    this.invalidate('HP.current', 'HP must be less than or equal to max HP.', this.get('HP.current'))
  }
  next()
})
CharacterSchema.virtual('stats').get(function (this: ICharacter) { return this.scores.stats }).set(function (this: ICharacter, skl: string, score: number) { this.scores.stats[skl] = score })
CharacterSchema.virtual('skills').get(function (this: ICharacter) { return this.scores.skills }).set(function (this: ICharacter, skl: string, score: number) { this.scores.skills[skl] = score })

export default mongoose.model('Character', CharacterSchema)
