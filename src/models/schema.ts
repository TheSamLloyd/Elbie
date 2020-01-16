import { User } from './userSchema'
import { Campaign } from './campaignSchema'
import { Character } from './characterSchema'
import { System } from './systemSchema'
import  mongoose  from 'mongoose'

export interface IModel<T extends mongoose.Document> extends mongoose.Model<T>{
}

export const db = { User, Campaign, Character, System }
