// dependencies
import Common from '../common'
import gameList from './systems/index'
const audio = require('../audio') || false

const DB_URI = process.env.MONGODB_URI || ""
import mongoose from 'mongoose'
import { Command } from '../../objects/command'
import { ICallback } from '../module'
import { db } from '../../models/schema'
import { ICampaign } from '../../models/campaignSchema'
import { ICharacter } from '../../models/characterSchema'
import { ISystem } from '../../models/systemSchema'
import { GameSystem } from './systems/game'
mongoose.set('useNewUrlParser', true)
mongoose.set('useCreateIndex', true)
mongoose.set('useUnifiedTopology', true)

mongoose.connect(DB_URI).then(
  () => {
    console.log('DB connection ready')
  },
  err => { console.log(`DB connection failed... \n${err}`) }
)

class Character extends db.Character implements ICharacter{
    constructor(){
        super()

    }
    getSystem(this:Character){
        
    }
}

export default Character