const Projectile = require("./projectile.js");
class Player {
	
	constructor(data, id, x, y){
		this.id = id;
		this.name = data.name;
		this.x = x;
		this.y = y;
		this.w = data.width;
		this.h = data.height;
		this.color = data.color;
		this.xv = 0;
		this.yv = 0;
		this.xa = 0;
		this.ya = 0;
		this.maxXV = this.maxYV = data.maxSpeed;
		this.friction = data.friction;
		this.maxHP = this.hp = data.maxHP;
		this.strength = data.strength;
		this.defense = data.defense;
		this.acceleration = data.acceleration;
		this.rechargeTime = data.recharge; //Frames
		this.shotData = data.shotData;
		this.ability = data.ability;
		this.keyList = [];
		this.shotTimer = 0;
		this.gone = false;
	}

	controls(){
		if(Math.abs(this.xv) <= this.maxXV){
			if(this.keyList[37]){
				if(this.xv > 0){
					this.xv = 0;
				}
				this.xa = -1*this.acceleration;	
			} else if(this.keyList[39]){
				if(this.xv < 0){
					this.xv = 0;
				}
				this.xa = this.acceleration;
			} else {
				this.xa = 0;
			}
		}
		if(Math.abs(this.yv) <= this.maxYV){
			if(this.keyList[38]){
				if(this.yv > 0){
					this.yv = 0;
				}
				this.ya = -1*this.acceleration;
			} else if(this.keyList[40]){
				if(this.yv < 0){
					this.yv = 0;
				}
				this.ya = this.acceleration;
			} else {
				this.ya = 0;
			}
		}
//		console.log(this.shotTimer);
		if(this.shotTimer <= 0){
			if(this.keyList[32]){
				let s = this.shotData.speed;
				let vx = this.xv, vy = this.yv;
				let r = Math.sqrt(this.xv**2 + this.yv**2);
				if(r === 0){
					vx = r = s;
					vy = 0;
				}
				this.shotData.xv = vx*s/r;
				this.shotData.yv = vy*s/r;
				this.shotData.strength = this.strength;
				this.shotData.owner = this.id;
				this.shotTimer = this.rechargeTime;
				return (new Projectile(this.x+this.w/2, this.y+this.h/2, this.shotData)); 
			}
		}
		return null;
	}

	kinematics(field){
		this.xv += this.xa;
		this.yv += this.ya;
		this.x += this.xv;
		this.y += this.yv;
		if(!this.keyList[37] && !this.keyList[39]){
			this.xv *= this.friction;
		}
		if(!this.keyList[38] && !this.keyList[40]){
			this.yv *= this.friction;
		}
		if(Math.abs(this.xv) < 0.1){
			this.xv = 0;
		}
		if(Math.abs(this.yv) < 0.1){
			this.yv = 0;
		}
		if(Math.abs(this.xv) > this.maxXV){
			this.xv = Math.sign(this.xv)*this.maxXV;
		}
		if(Math.abs(this.yv) > this.maxYV){
			this.yv = Math.sign(this.yv)*this.maxYV;
		}
		if(this.x < 0){
			this.x = 0;
		} else if(this.x+this.w > field.width){
			this.x = field.width - this.w;
		}
		if(this.y < 0){
			this.y = 0;
		} else if(this.y + this.h > field.height){
			this.y = field.height - this.h;
		}
	}

	collision(entityList){

	}

	getVisualData(){
		return {
			x: this.x,
			y: this.y,
			w: this.w,
			h: this.h,
			hp: Math.max(0, this.hp/this.maxHP),
			time: Math.min(1, 1-(this.shotTimer/this.rechargeTime)),
			type: "player",
			color: this.color,
			name: this.name,
			id: this.id,
			dead: this.gone
		};
	}

}
module.exports = Player;
