import { GameSystem, skillSystem } from "./game"
import { ICharacter } from "../models/characterSchema"

class DnD35 extends GameSystem {
  constructor() {
    super()
  }
  name = 'Dungeons and Dragons 3.5e'
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
    'appraise': new skillSystem('appraise', undefined, 'int'),
    'balance': new skillSystem('balance', undefined, 'dex'),
    'bluff': new skillSystem('bluff', undefined, 'cha'),
    'climb': new skillSystem('climb', undefined, 'str'),
    'concentration': new skillSystem('concentration', undefined, 'con'),
    'craft': new skillSystem('craft', undefined, 'int'),
    'decipher_script': new skillSystem('decipher_script', undefined, 'int'),
    'diplomacy': new skillSystem('diplomacy', undefined, 'cha'),
    'disable_device': new skillSystem('disable_device', undefined, 'int'),
    'disguise': new skillSystem('disguise', undefined, 'cha'),
    'escape_artist': new skillSystem('escape_artist', undefined, 'dex'),
    'forgery': new skillSystem('forgery', undefined, 'int'),
    'gather_information': new skillSystem('gather_information', undefined, 'cha'),
    'handle_animal': new skillSystem('handle_animal', undefined, 'cha'),
    'heal': new skillSystem('heal', undefined, 'wis'),
    'hide': new skillSystem('hide', undefined, 'dex'),
    'intimidate': new skillSystem('intimidate', undefined, 'cha'),
    'jump': new skillSystem('jump', undefined, 'str'),
    'knowledge_arcana': new skillSystem('knowledge_arcana', undefined, 'int'),
    'knowledge_architecture_and_engineering': new skillSystem('knowledge_architecture_and_engineering', undefined, 'int'),
    'knowledge_dungeoneering': new skillSystem('knowledge_dungeoneering', undefined, 'int'),
    'knowledge_geography': new skillSystem('knowledge_geography', undefined, 'dex'),
    'knowledge_history': new skillSystem('knowledge_history', undefined, 'int'),
    'knowledge_local': new skillSystem('knowledge_local', undefined, 'int'),
    'knowledge_nature': new skillSystem('knowledge_nature', undefined, 'int'),
    'knowledge_nobility_and_royalty': new skillSystem('knowledge_nobility_and_royalty', undefined, 'int'),
    'knowledge_religion': new skillSystem('knowledge_religion', undefined, 'int'),
    'knowledge_planes': new skillSystem('knowledge_planes', undefined, 'int'),
    'listen': new skillSystem('listen', undefined, 'wis'),
    'move_silently': new skillSystem('move_silently', undefined, 'dex'),
    'open_lock': new skillSystem('open_lock', undefined, 'dex'),
    'perform': new skillSystem('perform', undefined, 'cha'),
    'profession': new skillSystem('profession', undefined, 'wis'),
    'ride': new skillSystem('ride', undefined, 'dex'),
    'search': new skillSystem('search', undefined, 'int'),
    'sense_motive': new skillSystem('sense_motive', undefined, 'wis'),
    'sleight of hand': new skillSystem('sleight of hand', undefined, 'dex'),
    'speak_language': new skillSystem('speak_language'),
    'spellcraft': new skillSystem('spellcraft', undefined, 'int'),
    'spot': new skillSystem('spot', undefined, 'wis'),
    'survival': new skillSystem('survival', undefined, 'wis'),
    'swim': new skillSystem('swim', undefined, 'str'),
    'tumble': new skillSystem('tumble', undefined, 'dex'),
    'use_magic_device': new skillSystem('use_magic_device', undefined, 'cha'),
    'use_rope': new skillSystem('use_rope', undefined, 'dex')
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
