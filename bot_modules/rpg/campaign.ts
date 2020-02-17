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
    this.system = (cb: IFunction) => {
      gameList.retrieve(campaign.get('system'), (sys: GameSystem) => {
        if (sys != null) cb(sys)
        console.log(`->${sys.name}`)
      })
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
          console.log(campaign.get("name"))
          new Campaign(campaign)
        })
        Campaign.instantiatedAll = true
        console.log('Campaigns instantiated with no errors.')
      }
    })
  }
  instantiateCharacters(): void {
    db.Character.find().where({ campaign: this.id }).exec((err, chars: Document[]) => {
      chars.forEach(char => {
        console.log(`Instantiating character: ${char.get('name')}...\r`)
        this.characters.push(new Character(char))
      })
      if (!err) {
        console.log(`All characters for campaign ${this.name} instantiated!`)
      }
    })
  }
  isDM(id: User['id']): boolean {
    return (this.dm === id)
  }
  static get(serverId: Server['id'], channelId: Channel['id'], cb: IFunction): void {
    if (Campaign.allCampaigns[serverId]) {
      if (Campaign.allCampaigns[serverId]["all"]) {
        cb(Campaign.allCampaigns[serverId]["all"])
      }
      else if (Campaign.allCampaigns[serverId][channelId]) {
        cb(Campaign.allCampaigns[serverId][channelId])
      }
    }
    else {
      console.log('Campaign not in AllCampaigns, trying retrieve from DB...')
      Campaign.retrieve(serverId, channelId, cb)
    }
  }
}