import mongoose, { Schema, Document } from 'mongoose'
import { ICharacter } from './characterSchema'
import { ICampaign } from './campaignSchema'

export interface IUser extends Document {
  name: string
  characters: ICharacter[]
  dm: ICampaign[]
}

const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  _id: {
    type: String,
    required: true
  },
  characters: {
    type: [Schema.Types.ObjectId],
    ref: 'Character'
  },
  dm: {
    type: [Schema.Types.ObjectId],
    ref: 'Campaign'
  }
})
export default mongoose.model<IUser>('User', UserSchema)