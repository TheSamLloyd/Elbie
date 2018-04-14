var DungeonWorld = {
	defRoll : "2d6",
	skillAlias : {
		"str" : "Strength",
		"con" : "Constitution",
		"dex" : "Dexterity",
		"int" : "Intelligence",
		"wis" : "Wisdom",
		"cha" : "Charisma"
	},
	levelup : function(character){
		if (character.exp>=character.level+6){
			return true;
		}
		else return false;
	},
	mod : function(score){
		if (1<=score&&score<=3) val=-3;
		else if (4<=score&&score<=5) val=-2;
		else if (6<=score&&score<=8) val=-1;
		else if (9<=score&&score<=12) val=0;
		else if (13<=score&&score<=15) val=1;
		else if (16<=score&&score<=17) val=2;
		else if (score==18) val=3;
		else val=0;
		return val;
	}
}