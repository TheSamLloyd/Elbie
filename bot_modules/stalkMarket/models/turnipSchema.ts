import mongoose, { Document, Schema, DocumentQuery } from 'mongoose'
import { User } from 'discord.js'

export interface IMarket{
  ownerID:User["id"]
  lastBuyPrice?:number
  sellPrices:(number|undefined)[]
}

const MarketSchema = new Schema({
  ownerID:String,
  lastBuyPrice:{
    type:Number,
    required:false
  },
  sellPrices:{
    type:{},
    required:false
  }
})
export default mongoose.model('Market',MarketSchema)