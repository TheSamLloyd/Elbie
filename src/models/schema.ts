import User from  './userSchema'
import Campaign from './campaignSchema'
import Character from './characterSchema'
import System from './systemSchema'
import  mongoose  from 'mongoose'

export const db = { User, Campaign, Character, System }
