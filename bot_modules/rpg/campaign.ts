import { GameSystem } from './systems/game'
import { Character } from './character'
import { User, Channel, Guild as Server } from 'discord.js'
import { db } from './models/schema'
import { NativeError, Document } from 'mongoose'
import { ICampaign } from './models/campaignSchema'
import { IFunction } from '../module'
import gameList from './systems/index'
import nullGame from './systems/null-game'
import { isFunction } from 'util'

interface ISubCampaignList {
  [index: string]: Campaign
}
interface ICampaignList {
  [index: string]: ISubCampaignList
}
export class Campaign implements ICampaign {
  id: string = ""
  name: string = ""
  shortName?: string = ""
  system: (cb: IFunction) => void
  dm: User["id"] = ""
  serverWide: boolean = false
  channel: Channel['id'] | undefined
  server: Server['id'] = ""
  active: boolean
  characters: Character[] = []
  static allCampaigns: ICampaignList = {}
  static instantiatedAll: boolean = false
  constructor(campaign: Document) {
    this.name = campaign.get('name')
    this.shortName = campaign.get('shortname')
    this.dm = campaign.get('dm')
    this.serverWide = campaign.get('serverWide')
    this.id = campaign.id
    this.active = campaign.get('active')
    this.channel = campaign.get('channel')
    this.server = campaign.get('server')
    this.system = async () => {
      return await gameList.retrieve(campaign.get('system'))
    }
    if (!Campaign.allCampaigns[this.server]) {
      Campaign.allCampaigns[this.server] = {}
    }
    if (this.serverWide || this.channel === undefined) {
      Campaign.allCampaigns[this.server]["all"] = this
    }
    else {
      Campaign.allCampaigns[this.server][this.channel] = this
    }
    this.instantiateCharacters()
  }
  static async retrieve(serverId: Server['id'], channelId: Channel['id']): Promise<Campaign> {
    console.log('in the retrieve function...')
    let campaign: Document | null = await db.Campaign.findOne().where({ $or: [{ channel: channelId }, { server: serverId, serverWide: true }] }).exec()
    return new Promise((resolve, reject) => {
      console.log("inside the DB query..")
      if (campaign == null) {
        reject('No campaign...?')
      }
      else {
        console.log('Found a campaign!')
        resolve(new Campaign(campaign))
      }
    })
  }
  static async instatiateAllActiveCampaigns(): Promise<void> {
    let campaigns: Document[] = await db.Campaign.find().where({ 'active': true }).exec()
    campaigns.forEach(campaign => {
      console.log(campaign.get("name"))
      new Campaign(campaign)
    })
    Campaign.instantiatedAll = true
    console.log('Campaigns instantiated with no errors.')

  }
  async instantiateCharacters(): Promise<void> {
    let chars: Document[] = await db.Character.find().where({ campaign: this.id })
    try {
      chars.forEach(char => {
        console.log(`Instantiating character: ${char.get('name')}...\r`)
        this.characters.push(new Character(char))
      })
      console.log(`All characters for campaign ${this.name} instantiated!`)
    }
    catch (err){
      console.error(err)      
    }
  }
  isDM(id: User['id']): boolean {
    return (this.dm === id)
  }
  static async get(serverId: Server['id'], channelId: Channel['id']): Promise<Campaign> {
    return new Promise((resolve, reject) => {
      if (Campaign.allCampaigns[serverId]) {
        if (Campaign.allCampaigns[serverId]["all"]) {
          resolve(Campaign.allCampaigns[serverId]["all"])
        }
        else if (Campaign.allCampaigns[serverId][channelId]) {
          resolve(Campaign.allCampaigns[serverId][channelId])
        }
      }
      else {
        console.log('Campaign not in AllCampaigns, trying retrieve from DB...')
        resolve(Campaign.retrieve(serverId, channelId))
      }
    })
  }
}