import { GameSystem, skillSystem, statSystem } from "./game"
import { Character } from "../character"

class DnD35 extends GameSystem {
  constructor() {
    super()
  }
  name = 'Dungeons and Dragons 3.5e'
  defRoll = '1d20'
  stats = {
    "Strength": new statSystem('Strength', 'str'),
    "Constitution": new statSystem('Constitution', 'con'),
    "Dexterity": new statSystem('Dexterity', 'dex'),
    "Intelligence": new statSystem('Intelligence', 'int'),
    "Wisdom": new statSystem('Wisdom', 'wis'),
    "Charisma": new statSystem('Charisma', 'cha')
  }
  skills = {
    'appraise': new skillSystem('Appraise', undefined, 'int'),
    'balance': new skillSystem('Balance', undefined, 'dex'),
    'bluff': new skillSystem('Bluff', undefined, 'cha'),
    'climb': new skillSystem('Climb', undefined, 'str'),
    'concentration': new skillSystem('Concentration', undefined, 'con'),
    'craft': new skillSystem('Craft', undefined, 'int'),
    'decipher_script': new skillSystem('Decipher Script', undefined, 'int'),
    'diplomacy': new skillSystem('Diplomacy', undefined, 'cha'),
    'disable_device': new skillSystem('Disable Device', undefined, 'int'),
    'disguise': new skillSystem('Disguise', undefined, 'cha'),
    'escape_artist': new skillSystem('Escape Artist', undefined, 'dex'),
    'forgery': new skillSystem('Forgery', undefined, 'int'),
    'gather_information': new skillSystem('Gather Information', undefined, 'cha'),
    'handle_animal': new skillSystem('Handle Animal', undefined, 'cha'),
    'heal': new skillSystem('Heal', undefined, 'wis'),
    'hide': new skillSystem('Hide', undefined, 'dex'),
    'intimidate': new skillSystem('Intimidate', undefined, 'cha'),
    'jump': new skillSystem('Jump', undefined, 'str'),
    'knowledge_arcana': new skillSystem('Knowledge Arcana', undefined, 'int'),
    'knowledge_architecture_and_engineering': new skillSystem('Knowledge (Architecture and Engineering)', undefined, 'int'),
    'knowledge_dungeoneering': new skillSystem('Knowledge (Dungeoneering)', undefined, 'int'),
    'knowledge_geography': new skillSystem('Knowledge (Geography)', undefined, 'dex'),
    'knowledge_history': new skillSystem('Knowledge (History)', undefined, 'int'),
    'knowledge_local': new skillSystem('Knowledge (Local)', undefined, 'int'),
    'knowledge_nature': new skillSystem('Knowledge (Nature)', undefined, 'int'),
    'knowledge_nobility_and_royalty': new skillSystem('Knowledge (Nobility and Royalty)', undefined, 'int'),
    'knowledge_religion': new skillSystem('Knowledge (Religion)', undefined, 'int'),
    'knowledge_planes': new skillSystem('Knowledge (Planes)', undefined, 'int'),
    'listen': new skillSystem('Listen', undefined, 'wis'),
    'move_silently': new skillSystem('Move Silently', undefined, 'dex'),
    'open_lock': new skillSystem('Open Lock', undefined, 'dex'),
    'perform': new skillSystem('Perform', undefined, 'cha'),
    'profession': new skillSystem('Profession', undefined, 'wis'),
    'ride': new skillSystem('Ride', undefined, 'dex'),
    'search': new skillSystem('Search', undefined, 'int'),
    'sense_motive': new skillSystem('Sense Motive', undefined, 'wis'),
    'sleight of hand': new skillSystem('Sleight of Hand', undefined, 'dex'),
    'speak_language': new skillSystem('Speak Language'),
    'spellcraft': new skillSystem('Spellcraft', undefined, 'int'),
    'spot': new skillSystem('Spot', undefined, 'wis'),
    'survival': new skillSystem('Survival', undefined, 'wis'),
    'swim': new skillSystem('Swim', undefined, 'str'),
    'tumble': new skillSystem('Tumble', undefined, 'dex'),
    'use_magic_device': new skillSystem('Use Magic Device', undefined, 'cha'),
    'use_rope': new skillSystem('Use Rope', undefined, 'dex')
  }
  levelup = (character: Character): boolean => {
    return false
  }
  mod = function (score: number) {
    var val = Math.floor(score / 2) - 5
    return val
  }
}

export default new DnD35
