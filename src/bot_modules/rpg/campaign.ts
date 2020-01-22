import { GameSystem } from './systems/game'
import { Character } from './character'
import { Command } from '../../objects/command'
import { User, Channel, Guild as Server } from 'discord.js'
import { db } from '../../models/schema'
import { NativeError, Document } from 'mongoose'

interface ICampaignList {
  [id: string]: Campaign
}
export class Campaign extends db.Campaign {
  id: string = ""
  name: string = ""
  shortName?: string = ""
  system: GameSystem | undefined
  dm: User["id"] = ""
  allServer: boolean = false
  channel: Channel['id'] | undefined
  server: Server['id'] = ""
  static allCampaigns: ICampaignList
  constructor(id: string) {
    super()
    db.Campaign.findById(id).exec((err: NativeError, campaign) => {
      if (err || campaign === null) {
        console.warn("Could not instantiate a campaign.")
        console.error(err)
      } else {
        this.name = campaign.name
        this.shortName = campaign.shortname
        this.dm = campaign.dm
        this.allServer = campaign.serverWide
        this.id = id
        Campaign.allCampaigns[id] = this
      }
    })
  }
  static instatiateAllActiveCampaigns(): void {
    db.Campaign.find().where({ 'active': true }).exec((err: NativeError, campaigns) => {
      if (err) {
        console.warn('Could not retrieve campaigns for instantiation.')
        console.error(err)
      }
      else {
        campaigns.forEach(campaign => {
          new Campaign(campaign.id)
        })
        console.log('Campaigns instantiated with no errors.')
      }
    })
  }
  isDM(command: Command): boolean {
    return (this.dm === command.auth.id)
  }
  get(id?: string): Campaign {
    if (id) {
      return Campaign.allCampaigns[id]
    }
    else {
      return this
    }
  }
}