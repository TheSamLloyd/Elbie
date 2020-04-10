// dependencies
import common from '../common'
import { Module, Command } from '../module'
import { IMarket } from './models/turnipSchema'
import { User } from 'discord.js'
import turnip from './models/turnipSchema'

// class turnipFactory {
//   // retrieve by ID 
//   retrieve = async (id: User['id']): Promise<Market> => {
//     let foundMarket = await turnip.findOne({ ownerID: id }).exec()
//     return new Market({ user: (foundMarket.get('ownerID')), price: foundMarket.get('sellPrices').last() })


//   }
// }
class Market implements IMarket {
  ownerID: User['id']
  lastBuyPrice?: number
  sellPrices: number[]
  lastUpdate: number
  constructor({ user, price }: { user: User['id']; price?: number }) {
    this.ownerID = user
    this.lastUpdate = (new Date()).getHours() % 12
    if (price && price > 0) {
      this.sellPrices = [price]
    }
    else {
      this.sellPrices = []
      if (price && price < 0) {
        this.lastBuyPrice = price
      }
    }
  }
  addSellPrice = (price: number) => {
    this.sellPrices.push(price)
    this.lastUpdate = (new Date()).getHours() % 12
  }
  addBuyPrice = (price: number) => {
    this.lastBuyPrice = price
  }
  average = (): number => {
    let defined = this.sellPrices.filter((val) => val > 0)
    if (defined.length > 0) {
      let average = defined.reduce((prev, current) => prev + current) / defined.length
      return average
    }
    else {
      return 0
    }
  }
  stddev = (): number => {
    let defined = this.sellPrices.filter((val) => val > 0)
    if (defined.length > 1) {
      let average = this.average()
      let SD = Math.pow(defined.map((val: number) => Math.pow(val - average, 2)).reduce((prev, val) => prev + val), 1 / 2) / (defined.length - 1)
      return SD
    }
    else {
      return 0
    }
  }
  score = (): number => {
    let last = this.sellPrices[this.sellPrices.length - 1]
    let sd = this.stddev()
    let mean = this.average()
    if (sd > 0 && mean > 0) {
      return (last - mean) / sd
    }
    else {
      return 0
    }
  }
  getPrice = (): number => {
    let last = this.sellPrices[this.sellPrices.length - 1]
    let currentHour = (new Date()).getHours() % 12
    if (currentHour < this.lastUpdate) {
      return 0
    }
    else {
      return last
    }

  }
  set = (price: number) => {
    let d = new Date()
    if (d.getDay() == 0) {
      this.addBuyPrice(price)
    }
    else {
      this.addSellPrice(price)
    }
  }
}
// basic bot commands
class stalkMarket extends Module {
  name = 'stalk market'
  desc = 'utility for tracking turnip prices'
  record = async (command: Command) => {
    if (parseInt(command.argument)) {
      let value = parseInt(command.argument)
      //get Market from db
      let market = new Market({ user: command.auth.id })
      market.addBuyPrice(value)
      await command.reply(`The price of ${value.toString()} is ${market.score().toString()} sigma from your average price.`)
    }
  }
  commands = {}
}
export default new stalkMarket()