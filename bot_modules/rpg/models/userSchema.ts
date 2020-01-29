import mongoose, { Schema } from 'mongoose'

export interface IUser {
  id: string
  name: string
}

const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  _id: {
    type: String,
    required: true
  }
})
export default mongoose.model('User', UserSchema)