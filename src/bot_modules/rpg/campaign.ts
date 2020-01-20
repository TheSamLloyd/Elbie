import { GameSystem } from './systems/game'
import { Character } from './character'
import { Command } from '../../objects/command'
import { User, Channel, Guild as Server } from 'discord.js'
import { db } from '../../models/schema'
import { NativeError , Document} from 'mongoose'

interface campaignCollection extends object{
  [index:string]:Campaign
}

export class Campaign extends db.Campaign {
  id:string
  name:string
  shortName?:string
  system:GameSystem
  characters:Character[]
  dm:User["id"]
  allServer:boolean
  channel:Channel['id']|undefined
  server:Server['id']
  static allCampaigns:campaignCollection
  constructor(id:string|Document){
    super()
    if (typeof id==='string'){
      db.Campaign.findById(id).exec((err: NativeError, campaign) => {
        if (err) {
          console.warn("Could not instantiate a campaign.")
          console.error(err)
        } else {
          this.name = campaign['name']
          this.shortName = campaign['shtName']
          this.dm = campaign['dm']
          this.allServer = campaign['serverWide']
          this.characters = campaign['characters']
          this.id = id
          Campaign.allCampaigns[id] = this
        }
      })
    }
    else {
      let campaign=id
        this.name = campaign['name']
        this.shortName = campaign['shtName']
        this.dm = campaign['dm']
        this.allServer = campaign['serverWide']
        this.characters = campaign['characters']
        this.id = campaign['id']
        Campaign.allCampaigns[campaign['id']] = this
      }
    }
  static instatiateAllActiveCampaigns():void{
    db.Campaign.find().where({'active':true}).exec((err:NativeError,campaigns)=>{
      if (err){
        console.warn('Could not retrieve campaigns for instantiation.')
        console.error(err)
      }
      else{
        campaigns.forEach(campaign=>{
          new Campaign(campaign)
        })
        console.log('Campaigns instantiated with no errors.')
      }
    })
  }
  isDM(command:Command):boolean{
    return (this.dm===command.auth.id)
  }
  get(id?:string):Campaign{
    if (id){
      return Campaign.allCampaigns[id]
    }
    else {
      return this
    }
  }
}