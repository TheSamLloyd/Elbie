import { GameSystem, Skill, Stat, ScoreList } from "./game"
import { Character } from "../character"

class DnD35 extends GameSystem {
  constructor() {
    super()
  }
  name = 'Dungeons and Dragons 3.5e'
  defRoll = '1d20'
  stats = new ScoreList(
    [new Stat('Strength', 'str'),
    new Stat('Constitution', 'con'),
    new Stat('Dexterity', 'dex'),
    new Stat('Intelligence', 'int'),
    new Stat('Wisdom', 'wis'),
    new Stat('Charisma', 'cha')])

  skills = new ScoreList([
    new Skill('Appraise', undefined, 'int'),
    new Skill('Balance', undefined, 'dex'),
    new Skill('Bluff', undefined, 'cha'),
    new Skill('Climb', undefined, 'str'),
    new Skill('Concentration', undefined, 'con'),
    new Skill('Craft', undefined, 'int'),
    new Skill('Decipher Script', undefined, 'int'),
    new Skill('Diplomacy', undefined, 'cha'),
    new Skill('Disable Device', undefined, 'int'),
    new Skill('Disguise', undefined, 'cha'),
    new Skill('Escape Artist', undefined, 'dex'),
    new Skill('Forgery', undefined, 'int'),
    new Skill('Gather Information', undefined, 'cha'),
    new Skill('Handle Animal', undefined, 'cha'),
    new Skill('Heal', undefined, 'wis'),
    new Skill('Hide', undefined, 'dex'),
    new Skill('Intimidate', undefined, 'cha'),
    new Skill('Jump', undefined, 'str'),
    new Skill('Knowledge Arcana', undefined, 'int'),
    new Skill('Knowledge (Architecture and Engineering)', undefined, 'int'),
    new Skill('Knowledge (Dungeoneering)', undefined, 'int'),
    new Skill('Knowledge (Geography)', undefined, 'dex'),
    new Skill('Knowledge (History)', undefined, 'int'),
    new Skill('Knowledge (Local)', undefined, 'int'),
    new Skill('Knowledge (Nature)', undefined, 'int'),
    new Skill('Knowledge (Nobility and Royalty)', undefined, 'int'),
    new Skill('Knowledge (Religion)', undefined, 'int'),
    new Skill('Knowledge (Planes)', undefined, 'int'),
    new Skill('Listen', undefined, 'wis'),
    new Skill('Move Silently', undefined, 'dex'),
    new Skill('Open Lock', undefined, 'dex'),
    new Skill('Perform', undefined, 'cha'),
    new Skill('Profession', undefined, 'wis'),
    new Skill('Ride', undefined, 'dex'),
    new Skill('Search', undefined, 'int'),
    new Skill('Sense Motive', undefined, 'wis'),
    new Skill('Sleight of Hand', undefined, 'dex'),
    new Skill('Speak Language'),
    new Skill('Spellcraft', undefined, 'int'),
    new Skill('Spot', undefined, 'wis'),
    new Skill('Survival', undefined, 'wis'),
    new Skill('Swim', undefined, 'str'),
    new Skill('Tumble', undefined, 'dex'),
    new Skill('Use Magic Device', undefined, 'cha'),
    new Skill('Use Rope', undefined, 'dex')
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
