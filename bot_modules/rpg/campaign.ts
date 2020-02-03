import { GameSystem } from './systems/game'
import { Character } from './character'
import { User, Channel, Guild as Server } from 'discord.js'
import { db } from './models/schema'
import { NativeError, Document } from 'mongoose'
import { ICampaign } from './models/campaignSchema'
import { IFunction } from '../module'
import gameList from './systems/index'
import nullGame from './systems/null-game'

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
  system: GameSystem | undefined = nullGame
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
    gameList.retrieve(campaign.get('system'), (sys: GameSystem) => {
      if (sys) this.system = sys
    })
    if (this.serverWide || this.channel === undefined) {
      Campaign.allCampaigns[this.server]["all"] = this
    }
    else {
      Campaign.allCampaigns[this.server][this.channel] = this
    }
    this.instantiateCharacters()
  }
  static retrieve(serverId: Server['id'], channelId: Channel['id'], cb: IFunction): void {
    console.log('in the retrieve function...')
    db.Campaign.findOne().where({ $or: [{ channel: channelId }, { server: serverId, serverWide: true }] }).exec((err: NativeError, campaign: Document) => {
      console.log("inside the DB query..")
      if (err || campaign == null) {
        console.error(err || 'No campaign...?')
      }
      else {
        console.log('Found a campaign!')
        cb(new Campaign(campaign))
      }
    })
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
        this.instantiatedAll = true
        console.log('Campaigns instantiated with no errors.')
      }
    })
  }
  instantiateCharacters(): void {
    db.Character.find().where({ campaign: this.id }).exec((err, chars) => {
      chars.forEach(char => {
        this.characters.push(new Character(char))
      })
    })
  }
  isDM(id: User['id']): boolean {
    return (this.dm === id)
  }
  static get(serverId: Server['id'], channelId: Channel['id'], cb: IFunction): void {
    console.log(Campaign.allCampaigns)
    console.log('Campaign not in AllCampaigns, trying retrieve from DB...')
    Campaign.retrieve(serverId, channelId, cb)
  }
}