import { GameSystem } from "./game"
import { ICharacter } from "../models/characterSchema"

class DnD35 extends GameSystem {
  constructor() {
    super()
  }
  defRoll = '1d20'
  statAlias = {
    'str': 'Strength',
    'con': 'Constitution',
    'dex': 'Dexterity',
    'int': 'Intelligence',
    'wis': 'Wisdom',
    'cha': 'Charisma'
  }
  skills = {
    'appraise': 'int',
    'balance': 'dex',
    'bluff': 'cha',
    'climb': 'str',
    'concentration': 'con',
    'craft': 'int',
    'decipher_script': 'int',
    'diplomacy': 'cha',
    'disable_device': 'int',
    'disguise': 'cha',
    'escape_artist': 'dex',
    'forgery': 'int',
    'gather_information': 'cha',
    'handle_animal': 'cha',
    'heal': 'wis',
    'hide': 'dex',
    'intimidate': 'cha',
    'jump': 'str',
    'knowledge_arcana': 'int',
    'knowledge_architecture_and_engineering': 'int',
    'knowledge_dungeoneering': 'int',
    'knowledge_geography': 'dex',
    'knowledge_history': 'int',
    'knowledge_local': 'int',
    'knowledge_nature': 'int',
    'knowledge_nobility_and_royalty': 'int',
    'knowledge_religion': 'int',
    'knowledge_planes': 'int',
    'listen': 'wis',
    'move_silently': 'dex',
    'open_lock': 'dex',
    'perform': 'cha',
    'profession': 'wis',
    'ride': 'dex',
    'search': 'int',
    'sense_motive': 'wis',
    'sleight of hand': 'dex',
    'speak_language': null,
    'spellcraft': 'int',
    'spot': 'wis',
    'survival': 'wis',
    'swim': 'str',
    'tumble': 'dex',
    'use_magic_device': 'cha',
    'use_rope': 'dex'
  }
  levelup = (character: ICharacter): boolean => {
    return false
  }
  mod = function (score:number) {
    var val = Math.floor(score / 2) - 5
    return val
  }
}

export default new DnD35