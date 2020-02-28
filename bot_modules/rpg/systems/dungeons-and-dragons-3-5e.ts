import { GameSystem, Score, ScoreList } from "./game"
import { Character } from "../character"

class DnD35 extends GameSystem {
  constructor() {
    super()
  }
  name = 'Dungeons and Dragons 3.5e'
  defRoll = '1d20'
  stats = new ScoreList(
    [new Score({name: 'Strength', shortName: 'str'}),
    new Score({name: 'Constitution', shortName: 'con'}),
    new Score({name: 'Dexterity', shortName:'dex'}),
    new Score({name: 'Intelligence', shortName: 'int'}),
    new Score({name: 'Wisdom', shortName:'wis'}),
    new Score({name:'Charisma', shortName:'cha'})])

  skills = new ScoreList([
    new Score({name:'Appraise', stat: this.stats['Intelligence']}),
    new Score({name:'Balance', stat: this.stats['Dexterity']}),
    new Score({name:'Bluff', stat: this.stats['Charisma']}),
    new Score({name:'Climb', stat: this.stats['Strength']}),
    new Score({name:'Concentration', stat: this.stats['Constitution']}),
    new Score({name:'Craft', stat: this.stats['Intelligence']}),
    new Score({name:'Decipher Script', stat: this.stats['Intelligence']}),
    new Score({name:'Diplomacy', stat: this.stats['Charisma']}),
    new Score({name:'Disable Device', stat: this.stats['Intelligence']}),
    new Score({name:'Disguise', stat: this.stats['Charisma']}),
    new Score({name:'Escape Artist', stat: this.stats['Dexterity']}),
    new Score({name:'Forgery', stat: this.stats['Intelligence']}),
    new Score({name:'Gather Information', stat: this.stats['Charisma']}),
    new Score({name:'Handle Animal', stat: this.stats['Charisma']}),
    new Score({name:'Heal', stat: this.stats['Wisdom']}),
    new Score({name:'Hide', stat: this.stats['Dexterity']}),
    new Score({name:'Intimidate', stat: this.stats['Charisma']}),
    new Score({name:'Jump', stat: this.stats['Strength']}),
    new Score({name:'Knowledge Arcana', stat: this.stats['Intelligence']}),
    new Score({name:'Knowledge (Architecture and Engineering)', stat: this.stats['Intelligence']}),
    new Score({name:'Knowledge (Dungeoneering)', stat: this.stats['Intelligence']}),
    new Score({name:'Knowledge (Geography)', stat: this.stats['Dexterity']}),
    new Score({name:'Knowledge (History)', stat: this.stats['Intelligence']}),
    new Score({name:'Knowledge (Local)', stat: this.stats['Intelligence']}),
    new Score({name:'Knowledge (Nature)', stat: this.stats['Intelligence']}),
    new Score({name:'Knowledge (Nobility and Royalty)', stat: this.stats['Intelligence']}),
    new Score({name:'Knowledge (Religion)', stat: this.stats['Intelligence']}),
    new Score({name:'Knowledge (Planes)', stat: this.stats['Intelligence']}),
    new Score({name:'Listen', stat: this.stats['Wisdom']}),
    new Score({name:'Move Silently', stat: this.stats['Dexterity']}),
    new Score({name:'Open Lock', stat: this.stats['Dexterity']}),
    new Score({name:'Perform', stat: this.stats['Charisma']}),
    new Score({name:'Profession', stat: this.stats['Wisdom']}),
    new Score({name:'Ride', stat: this.stats['Dexterity']}),
    new Score({name:'Search', stat: this.stats['Intelligence']}),
    new Score({name:'Sense Motive', stat: this.stats['Wisdom']}),
    new Score({name:'Sleight of Hand', stat: this.stats['Dexterity']}),
    new Score({name:'Speak Language'}),
    new Score({name:'Spellcraft', stat: this.stats['Intelligence']}),
    new Score({name:'Spot', stat: this.stats['Wisdom']}),
    new Score({name:'Survival', stat: this.stats['Wisdom']}),
    new Score({name:'Swim', stat: this.stats['Strength']}),
    new Score({name:'Tumble', stat: this.stats['Dexterity']}),
    new Score({name:'Use Magic Device', stat: this.stats['Charisma']}),
    new Score({name:'Use Rope', stat: this.stats['Dexterity']}),
  ])

  levelup = (character: Character): boolean => {
    return false
  }
  mod = function (score: number) {
    var val = Math.floor(score / 2) - 5
    return val
  }
}

export default new DnD35
