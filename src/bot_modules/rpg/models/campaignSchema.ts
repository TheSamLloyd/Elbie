import mongoose, { Document, Schema, DocumentQuery} from 'mongoose'
import { ISystem } from './systemSchema'
import { IUser } from './userSchema'
import { Command } from '../../../objects/command'

export interface ICampaign {
  id:string
  name: string
  shortname?: string
  channel?: string
  server: string
  dm: IUser['id']
  theme?: string
  active: boolean
  system: ISystem['id']
  serverWide: boolean
}

const CampaignSchema: Schema = new Schema({
  name: {
    type: String,
    required: true
  },
  shortname: {
    type: String
  },
  channel: {
    type: String,
    required: false,
    index: true
  },
  server: {
    type: String,
    required: true
  },
  dm: {
    type: String,
    required: true,
    ref: 'User'
  },
  theme: String,
  active: { type: Boolean, default: true },
  system: { type: Schema.Types.ObjectId, required: true, ref: 'System' },
  serverWide: {
    type: Boolean,
    required: true,
    default: false
  }
})

CampaignSchema.query.byCommand = function (cmd: Command): ICampaign {
  return this.where({ $or: [{ channel: cmd.channel.id }, { server: cmd.server.id, serverWide: true }] })
}
CampaignSchema.query.allActive = function (): ICampaign[] {
  return this.where({ active: true })
}

export default mongoose.model('Campaign', CampaignSchema)