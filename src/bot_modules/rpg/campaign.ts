import { GameSystem } from './systems/game'
import { Character } from './character'
import { Command } from '../../objects/command'
import { User, Channel, Guild as Server } from 'discord.js'
import { db } from './models/schema'
import { NativeError, Document } from 'mongoose'
import { ICampaign } from './models/campaignSchema'

interface ICampaignList {
  [id: string]: Campaign
}
export class Campaign implements ICampaign {
  id: string = ""
  name: string = ""
  shortName?: string = ""
  system: GameSystem | undefined
  dm: User["id"] = ""
  serverWide: boolean = false
  channel: Channel['id'] | undefined
  server: Server['id'] = ""
  active: boolean
  static allCampaigns: ICampaignList
  constructor(campaign: Document) {
    this.name = campaign.get('name')
    this.shortName = campaign.get('shortname')
    this.dm = campaign.get('dm')
    this.serverWide = campaign.get('serverWide')
    this.id = campaign.id
    this.active = campaign.get('active')
    Campaign.allCampaigns[this.id] = this
  }
  static async get(id: ICampaign['id']): Promise<Campaign | undefined> {
    let campaign = await db.Campaign.findById(id).exec((err: NativeError, campaign: Document) => {
      return campaign
    })
    if (campaign === null) {
      console.warn("Could not instantiate a campaign.")
    } else {
      return new Campaign(campaign)
    }
  }
  static instatiateAllActiveCampaigns(): void {
    db.Campaign.find().where({ 'active': true }).exec((err:Error, campaigns:Document[]) => {
      if (err) {
        console.warn('Could not retrieve campaigns for instantiation.')
        console.error(err)
      }
      else {
        campaigns.forEach(campaign => {
          new Campaign(campaign)
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