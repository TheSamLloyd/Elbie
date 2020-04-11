import { GameSystem, Score, ScoreList } from "./game"
import { Character } from "../character"

class DnD35 extends GameSystem {
  constructor() {
    super()
  }
  name = 'Dungeons and Dragons 3.5e'
  defRoll = '1d20'
  stats = new ScoreList(
    new Score({name: 'Strength', shortName: 'str'}),
    new Score({name: 'Constitution', shortName: 'con'}),
    new Score({name: 'Dexterity', shortName:'dex'}),
    new Score({name: 'Intelligence', shortName: 'int'}),
    new Score({name: 'Wisdom', shortName:'wis'}),
    new Score({name:'Charisma', shortName:'cha'}))

  skills = new ScoreList(
    new Score({name:'Appraise', stat: <Score>this.stats.get('Intelligence')}),
    new Score({name:'Balance', stat: <Score>this.stats.get('Dexterity')}),
    new Score({name:'Bluff', stat: <Score>this.stats.get('Charisma')}),
    new Score({name:'Climb', stat: <Score>this.stats.get('Strength')}),
    new Score({name:'Concentration', stat: <Score>this.stats.get('Constitution')}),
    new Score({name:'Craft', stat: <Score>this.stats.get('Intelligence')}),
    new Score({name:'Decipher Script', stat: <Score>this.stats.get('Intelligence')}),
    new Score({name:'Diplomacy', stat: <Score>this.stats.get('Charisma')}),
    new Score({name:'Disable Device', stat: <Score>this.stats.get('Intelligence')}),
    new Score({name:'Disguise', stat: <Score>this.stats.get('Charisma')}),
    new Score({name:'Escape Artist', stat: <Score>this.stats.get('Dexterity')}),
    new Score({name:'Forgery', stat: <Score>this.stats.get('Intelligence')}),
    new Score({name:'Gather Information', stat: <Score>this.stats.get('Charisma')}),
    new Score({name:'Handle Animal', stat: <Score>this.stats.get('Charisma')}),
    new Score({name:'Heal', stat: <Score>this.stats.get('Wisdom')}),
    new Score({name:'Hide', stat: <Score>this.stats.get('Dexterity')}),
    new Score({name:'Intimidate', stat: <Score>this.stats.get('Charisma')}),
    new Score({name:'Jump', stat: <Score>this.stats.get('Strength')}),
    new Score({name:'Knowledge Arcana', stat: <Score>this.stats.get('Intelligence')}),
    new Score({name:'Knowledge (Architecture and Engineering)', stat: <Score>this.stats.get('Intelligence')}),
    new Score({name:'Knowledge (Dungeoneering)', stat: <Score>this.stats.get('Intelligence')}),
    new Score({name:'Knowledge (Geography)', stat: <Score>this.stats.get('Dexterity')}),
    new Score({name:'Knowledge (History)', stat: <Score>this.stats.get('Intelligence')}),
    new Score({name:'Knowledge (Local)', stat: <Score>this.stats.get('Intelligence')}),
    new Score({name:'Knowledge (Nature)', stat: <Score>this.stats.get('Intelligence')}),
    new Score({name:'Knowledge (Nobility and Royalty)', stat: <Score>this.stats.get('Intelligence')}),
    new Score({name:'Knowledge (Religion)', stat: <Score>this.stats.get('Intelligence')}),
    new Score({name:'Knowledge (Planes)', stat: <Score>this.stats.get('Intelligence')}),
    new Score({name:'Listen', stat: <Score>this.stats.get('Wisdom')}),
    new Score({name:'Move Silently', stat: <Score>this.stats.get('Dexterity')}),
    new Score({name:'Open Lock', stat: <Score>this.stats.get('Dexterity')}),
    new Score({name:'Perform', stat: <Score>this.stats.get('Charisma')}),
    new Score({name:'Profession', stat: <Score>this.stats.get('Wisdom')}),
    new Score({name:'Ride', stat: <Score>this.stats.get('Dexterity')}),
    new Score({name:'Search', stat: <Score>this.stats.get('Intelligence')}),
    new Score({name:'Sense Motive', stat: <Score>this.stats.get('Wisdom')}),
    new Score({name:'Sleight of Hand', stat: <Score>this.stats.get('Dexterity')}),
    new Score({name:'Speak Language'}),
    new Score({name:'Spellcraft', stat: <Score>this.stats.get('Intelligence')}),
    new Score({name:'Spot', stat: <Score>this.stats.get('Wisdom')}),
    new Score({name:'Survival', stat: <Score>this.stats.get('Wisdom')}),
    new Score({name:'Swim', stat: <Score>this.stats.get('Strength')}),
    new Score({name:'Tumble', stat: <Score>this.stats.get('Dexterity')}),
    new Score({name:'Use Magic Device', stat: <Score>this.stats.get('Charisma')}),
    new Score({name:'Use Rope', stat: <Score>this.stats.get('Dexterity')}),
  )

  levelup = (character: Character): boolean => {
    return false
  }
  mod = function (score: number) {
    var val = Math.floor(score / 2) - 5
    return val
  }
}

export default new DnD35
