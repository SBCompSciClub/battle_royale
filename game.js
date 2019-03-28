const Player = require("./player.js");
class Game{
	
	constructor(field){
			
		this.entityList = [];
		this.players = new Map();
		this.field = field;
		this.visualData = [];
		this.survivors = 0;
	}

	initialize(playerMap){
		this.players.clear();
		this.entityList = [];
		let iterator = playerMap.keys();
		for(let key of iterator){
			let p = new Player(playerMap.get(key).player, key,
			Math.random()*this.field.width, Math.random()*this.field.height);
			this.players.set(key, p);
		}
		this.survivors = this.players.size;
	}

	loop(socket){
		this.entityList = this.cleanList(this.entityList);
		for(let p of this.players.values()){
			//console.log(p.keyList[37]);
			let projectile = p.controls();
//			console.log(projectile);
			if(projectile !== null){
				this.entityList.push(projectile);
			}
			p.kinematics(this.field);
		}
		for(let e of this.entityList){
			e.kinematics(this.field);
			e.collision(this.players);
		}
		this.visualData = [];
		for(let player of this.players.values()){
			this.visualData.push(player.getVisualData());
		}
		for(let e of this.entityList){
			this.visualData.push(e.getVisualData());
		}		
		for(let player of this.players.values()){
			if(!player.gone){
				player.shotTimer--;
				if(player.hp <= 0){
					player.gone = true;
					this.survivors--;
				}
			}
		}
	}
	
	getVisualData(){
		return this.visualData; 
	}

	cleanList(list){
		list = list.filter( (v)=>!v.gone);
		return list;
	}

}

module.exports = Game;
