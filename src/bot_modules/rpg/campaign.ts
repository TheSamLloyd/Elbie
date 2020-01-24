import { GameSystem } from './systems/game'
import { Character } from './character'
import { User, Channel, Guild as Server } from 'discord.js'
import { db } from './models/schema'
import { NativeError, Document } from 'mongoose'
import { ICampaign } from './models/campaignSchema'

interface ISubCampaignList {
  [index:string]: Campaign
}
interface ICampaignList {
  [index: string]: ISubCampaignList
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
    this.channel = campaign.get('channel')
    if (this.serverWide || this.channel===undefined){
      Campaign.allCampaigns[this.server]["all"] = this
    }
    else {
      Campaign.allCampaigns[this.server][this.channel] = this
    }
  }
  static async retrieve(serverId: Server['id'], channelId: Channel['id']): Promise<Campaign | undefined> {
    let campaign = await db.Campaign.findOne().where({ $or: [{ channel: channelId }, { server: serverId, serverWide: true }] }).exec((err: NativeError, campaign: Document) => {
      return campaign
    })
    if (campaign === null) {
      console.warn("Could not instantiate a campaign.")
    } else {
      return new Campaign(campaign)
    }
  }
  static instatiateAllActiveCampaigns(): void {
    db.Campaign.find().where({ 'active': true }).exec((err: Error, campaigns: Document[]) => {
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
  isDM(id: User['id']): boolean {
    return (this.dm === id)
  }
  get(serverId: Server['id'], channelId: Channel['id']): Campaign {
    let possibleReturn = null
    if (typeof Campaign.allCampaigns[serverId]["all"] == typeof Campaign){
      possibleReturn = Campaign.allCampaigns[serverId]["all"]
    }
    else if (typeof Campaign.allCampaigns[serverId][channelId] === typeof Campaign){
      possibleReturn = Campaign.allCampaigns[serverId][channelId]
    }
    if (possibleReturn) {
      return possibleReturn
    } else {
      Campaign.retrieve(serverId, channelId)
      return this.get(serverId, channelId)
    }
  }
}