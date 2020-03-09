// dependencies
import common from '../common'
import { Module, Command } from '../module'
import { Die } from '../rpg/dice'
import { MessageEmbed } from 'discord.js'
// basic bot commands

enum colors {
  "",
  "black",
  "white"
}
enum states {
  "Setup",
  "Act I",
  "Tilt",
  "Act II",
  "Aftermath"
}
enum actions {
  "Establish",
  "Resolve",
  "None"
}

interface gameStateObj {
  [index: string]: gameObject
}
interface gameObject {
  nPlayers: number
  whosIn: number
  phase: states
  activePlayer: number
  activeAction: actions
  sceneColor: colors
  pool: gamePool
  tilters: string[]
  players: {
    [index: number]: playerObject
  }
}

class playerObject {
  id: string = ""
  nickname: string = ""
  pool = new poolObject()
  charName?: string
  playerNumber: number
  displayName: string
  constructor(user: Command['auth'], n: number, cName?: string) {
    this.id = user.id
    this.nickname = user.username
    this.playerNumber = n
    this.charName = cName
    this.displayName = cName ? `${cName} (${this.nickname})` : this.nickname
  }
}
interface bins {
  [index: string]: number
}
class poolObject {
  whiteDice: number[] = []
  blackDice: number[] = []
  nW: number = 0
  nB: number = 0
  bin = (arr: number[]): bins => {
    let bins: bins = {}
    arr.forEach((num: number) => {
      if (bins[num.toString()]) { bins[num.toString()]++ }
      else {
        bins[num.toString()] = 1
      }
    })
    console.log(bins)
    return bins
  }
  displayBins = (bin: bins): MessageEmbed => {
    let embed = new MessageEmbed().setTitle('Pool').setColor('#633738')
    var output = "\`\`\`🎲 | #\n"
    for (var i = 1; i <= 6; i++) {
      if (bin[i.toString()]) {
        output += ` ${i.toString()} | ${bin[i.toString()]}\n`
      }
    }
    output += "\`\`\`"
    embed.addField('Pool', output)
    return embed
  }
}

class gamePool extends poolObject {
  setupPool: bins
  setupN: number
  tiltPool: bins
  tiltN: number
  constructor(n: number) {
    super()
    this.setupPool = this.bin(new Die(`${4 * n}d6`).roll())
    this.tiltPool = this.bin(new Die(`${2 * n}d6`).roll())
    this.setupN = 4 * n
    this.tiltN = 2
    this.nW = 2 * n
    this.nB = 2 * n
  }
}

class fiasco extends Module {
  name = 'fiasco'
  desc = 'module to run the game Fiasco'
  gameState: gameStateObj = {}
  start = (command: Command) => {
    command.reply("Starting Fiasco!")
    if (parseInt(command.args[0])) {
      const n: number = parseInt(command.args[0])
      this.gameState[command.channel.id] = {
        sceneColor: colors[''],
        nPlayers: n,
        whosIn: 0,
        phase: states['Setup'],
        activePlayer: 1,
        activeAction: actions['None'],
        pool: new gamePool(n),
        players: {},
        tilters: []
      }
      command.reply('**SETUP**: Use `+setme 1` to declare who player 1 will be, in any order.')
    }
    else {
      command.reply('I couldn\'t set up your game because you didn\'t tell me how many players you have. Try `+fiasco n` where *n* is the number of players you have.')
    }
  }
  setQ = (command: Command) => {
    if (this.gameState[command.channel.id]) return this.gameState[command.channel.id]
    else {
      command.reply("You don't have a Fiasco game going to use this command. Start one with `+fiasco n` where *n* is the number of players.")
      return false
    }
  }
  turnQ = (user: Command['auth'], game: gameObject) => {
    return (game.players[game.activePlayer].id == user.id)
  }
  whoseTurn = (game: gameObject): string => {
    return `It's ${game.players[game.activePlayer].displayName}'s turn.`
  }
  advanceTurn = (gameState: gameObject): string => {
    gameState.activePlayer = ((gameState.activePlayer + 1) % gameState.nPlayers) + 1
    gameState.sceneColor = colors[""]
    return this.whoseTurn(gameState)
  }
  assignPlayer = (command: Command) => {
    let gameState: gameObject | false = this.setQ(command)
    if (gameState && gameState.whosIn < gameState.nPlayers) {
      if (parseInt(command.args[0])) {
        let pN: number = parseInt(command.args[0])
        console.log("Trying to assign player number " + pN.toString())
        if (1 <= pN && pN <= gameState.nPlayers && !gameState.players[pN]) {
          gameState.players[pN] = new playerObject(command.auth, pN, command.args.slice(1).join(" "))
          console.log('Assigned player number ' + pN.toString())
          gameState.whosIn++
          command.reply(`Success! You're player ${pN.toString()}. ${gameState.whosIn.toString()} out of ${gameState.nPlayers.toString()} are ready.`)
        }
        else {
          command.reply('Either that number is taken or it\'s out of bounds (e.g. you picked player 5 in a 4-player game.)')
        }
      }
      else {
        command.reply('I couldn\'t read your number as an integer. Try again, please.')
      }
    } else {
      command.reply("Looks like this game is full!")
    }
    if (gameState && gameState.whosIn == gameState.nPlayers) {
      command.reply(`Everyone's in! Let's move on.\nIt's ${gameState.players[1].displayName}'s turn.`)
      command.reply(gameState.pool.displayBins(gameState.pool.setupPool))
    }
  }
  takeFromPool = (command: Command) => {
    let gameState: gameObject | false = this.setQ(command)
    if (gameState && (this.turnQ(command.auth, gameState) || gameState.phase == states['Tilt'])) {
      let die = parseInt(command.args[0])
      if (gameState.phase == states.Tilt && die) {
        if (gameState.tilters.includes(command.auth.id) && die && gameState.pool.tiltN >= 1) {
          gameState.pool.tiltPool[die]--
          gameState.pool.tiltN--
          let idIndex = gameState.tilters.indexOf(command.auth.id)
          gameState.tilters = gameState.tilters.filter((val, index) => index != idIndex)
          command.reply(`Successfully took a ${die.toString()} from the pool.`)
          command.reply(gameState.pool.displayBins(gameState.pool.tiltPool))
        }
        else if (die) {
          command.reply(`You can't take from the pool right now.`)
        }
        if (gameState.pool.tiltN == 0) {
          command.reply(`Time for **Act II**!`)
          this.startActII(gameState, command)
        }
      }
      else {
        if (gameState.phase == states.Setup && gameState.whosIn == gameState.nPlayers && die) {
          if (gameState.pool.setupPool[die] > 0 && gameState.pool.setupN > 1) {
            gameState.pool.setupPool[die]--
            gameState.pool.setupN--
            command.reply(`Successfully took a ${die.toString()} from the pool. New pool:\n${gameState.pool.displayBins(gameState.pool.setupPool)}\n${this.advanceTurn(gameState)}`)
          }
          else if (gameState.pool.setupN == 1) {
            command.reply(`Successfully took a wild ${die.toString()} from the pool. The pool is empty!`)
            this.startActI(gameState, command)
          }
          else {
            command.reply("You can't take that number from the pool.")
          }
        } else {
          command.reply("Wait for everyone to get in the game.")
        }

      }
    } else {
      if (gameState && gameState.phase != states.Tilt) command.reply(`Only ${gameState.players[gameState.activePlayer].displayName} can take right now.`)
    }
  }
  startActI = (game: gameObject, command: Command) => {
    this.advanceTurn(game)
    game.phase = states['Act I']
    command.reply("**ACT I**: Each turn, use `+scene e(stablish)` or `+scene r(esolve)`.")
  }
  startActII = (game: gameObject, command: Command) => {
    this.advanceTurn(game)
    game.phase = states['Act II']
    command.reply("**ACT II**: Each turn, use `+scene e(stablish)` or `+scene r(esolve)`.")
  }
  sceneEstablishorResolve = (command: Command) => {
    let gameState: gameObject | false = this.setQ(command)
    let begin: string = command.args[0].toLowerCase()[0]
    if (gameState && this.turnQ(command.auth, gameState) && (begin == 'e' || begin == 'r')) {
      let output = ""
      if (command.args[0].toLowerCase().startsWith('e')) {
        gameState.activeAction = actions['Establish']
        output += 'Anyone *else* may use `+color black/white` (or b/w) to set the color of the scene.'
      }
      else if (command.args[0].toLowerCase().startsWith('r')) {
        gameState.activeAction = actions['Resolve']
        output += 'You may use `+color black/white` (or b/w) to set the color of the scene.'
      }
      if (gameState.phase == states['Act I']) {
        output += '\nAt the end of your scene, use `+endscene`.'
      }
      command.reply(output)
      this.showPool(command)
    }
  }
  showPool = (command: Command) => {
    let gameState: gameObject | false = this.setQ(command)
    if (gameState) {
      let embed = new MessageEmbed().setTitle("Pool").setColor('#633738')
      embed.addField(`Dice Pool`, `${gameState.pool.nW}W / ${gameState.pool.nB}B`)
      for (var i = 1; i <= gameState.nPlayers; i++) {
        embed.addField(`${gameState.players[i].displayName}`, `${gameState.players[i].pool.nW}W / ${gameState.players[i].pool.nB}B`)
      }
      command.reply(embed)
    }
  }
  tilt = (game: gameObject) => {
    game.phase=states['Tilt']
    game.pool.displayBins(game.pool.tiltPool)
    let highW = {
      player: 0,
      number: 0,
    }
    let highB = {
      player: 0,
      number: 0,
    }
    //this Tilt logic can and should be adjusted. 
    for (var i = 1; i <= game.nPlayers; i++) {
      let player = game.players[i]
      let dW = new Die(`${player.pool.nW}d6`).roll().reduce((total, val) => total + val)
      let dB = new Die(`${player.pool.nB}d6`).roll().reduce((total, val) => total + val)
      if (dW > highW.number || (dW == highW.number && Math.random() > (1 / game.nPlayers))) {
        highW.number = dW
        highW.player = i
      }
      if (dB > highB.number || (dB == highB.number && Math.random() > (1 / game.nPlayers))) {
        highB.number = dB
        highB.player = i
      }
    }
    let output = `High white roller is ${game.players[highW.player].displayName}!\nHigh black roller is ${game.players[highB.player].displayName}!\n`
    game.tilters = [highW.player, highB.player].map((val) => game.players[val].id)
    return output
  }
  setColor = (command: Command) => {
    let gameState: gameObject | false = this.setQ(command)
    let begin: string = command.args[0] ? command.args[0].toLowerCase()[0] : ""
    let change = false
    if (gameState && (gameState.phase == states['Act I'] || gameState.phase == states['Act II']) && (begin == 'b' || begin == 'w')) {
      if (this.turnQ(command.auth, gameState) ? gameState.activeAction !== actions['Establish'] : gameState.activeAction == actions['Establish']) {
        if (begin == 'w' && (gameState.pool.nW >= 1 || gameState.pool.nW + gameState.pool.nB == 1)) {
          gameState.sceneColor = colors['white']
          change = true
        }
        else if (begin == 'b' && (gameState.pool.nB >= 1 || gameState.pool.nW + gameState.pool.nB == 1)) {
          gameState.sceneColor = colors['black']
          change = true
        }
        if (change) {
          command.reply(`Set the scene's color to ${colors[gameState.sceneColor]}`)
        }
      }
    }
  }
  endScene = (command: Command) => {
    let gameState: gameObject | false = this.setQ(command)
    if (gameState && gameState.phase == states['Act I'] && parseInt(command.args[0]) <= gameState.nPlayers) {
      let player = parseInt(command.args[0])
      command.reply(`Gave  ${gameState.players[player].displayName} a ${colors[gameState.sceneColor]} die.`)
      if (gameState.sceneColor == colors['white']) {
        gameState.players[player].pool.nW++
        gameState.pool.nW--
      }
      if (gameState.sceneColor == colors['black']) {
        gameState.players[player].pool.nB++
        gameState.pool.nB--
      }
      if (gameState.pool.nW + gameState.pool.nB > 2 * gameState.nPlayers) {
        this.showPool(command)
        command.reply(this.advanceTurn(gameState))
      }
      else {
        this.showPool(command)
        command.reply(`Time for **The Tilt**.\n${this.tilt(gameState)}`)
      }
    }
    if (gameState && gameState.phase == states['Act II']) {
      command.reply(`Took a ${colors[gameState.sceneColor]} die.`)
      if (gameState.sceneColor == colors['white']) {
        gameState.players[gameState.activePlayer].pool.nW++
        gameState.pool.nW--
      }
      if (gameState.sceneColor == colors['black']) {
        gameState.players[gameState.activePlayer].pool.nB++
        gameState.pool.nB--
      }
      if (gameState.pool.nW + gameState.pool.nB > 0) {
        this.showPool(command)
        command.reply(this.advanceTurn(gameState))
      }
      else {
        this.showPool(command)
        command.reply('Time for **the Aftermath**.')
      }
    }
  }
  aftermath = () => {

  }
  release = (command: Command) => {

  }
  ending = () => {

  }
  commands = {
    fiasco: { key: this.start, desc: 'Starts a new fiasco game with the given number of players.' },
    setme: { key: this.assignPlayer, desc: 'Echoes back whatever text is sent. Cannot be used to trigger her commands.' },
    take: { key: this.takeFromPool, desc: 'Echoes back whatever text is sent. Cannot be used to trigger her commands.' },
    scene: { key: this.sceneEstablishorResolve, desc: 'Echoes back whatever text is sent. Cannot be used to trigger her commands.' },
    color: { key: this.setColor, desc: 'Echoes back whatever text is sent. Cannot be used to trigger her commands.' },
    endscene: { key: this.endScene, desc: 'Echoes back whatever text is sent. Cannot be used to trigger her commands.' },
    show: { key: this.showPool, desc: '' }
  }
}

export default new fiasco()