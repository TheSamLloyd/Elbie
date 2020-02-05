import mongoose, { Schema, Document } from 'mongoose'

export interface ISystem extends Document {
  name: string
  path: string
}

const SystemSchema = new Schema({
  name: {
    type: String,
    required: true
  }
})

SystemSchema.virtual('path').get(function (this: ISystem) {
  return `../bot_modules/rpg/${this.name.replace(/\W+/g, '-').toLowerCase()}.js`
})

export default mongoose.model<ISystem>('System', SystemSchema)
