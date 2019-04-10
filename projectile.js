class Projectile{
	
	constructor(x, y, data){
		this.x = x;
		this.y = y;
		this.w = data.width;
		this.h = data.height;
		this.color = data.color;
		this.xv = data.xv;
		this.yv = data.yv;
		this.power = data.power;
		this.owner = data.owner;
		this.strength = data.strength;
		this.gone = false;
	}

	kinematics(field){
		this.x += this.xv;
		this.y += this.yv;
		if(this.x < 0 || this.x > field.width ||
			this.y < 0 || this.y > field.height){
			this.gone = true;
		}
	}

	collision(players){
		for(let [id, player] of players){
			if(this.owner !== id && !player.gone){
				if(this.x < player.x + player.w &&
					this.x + this.h > player.x &&
					this.y < player.y + player.h &&
					this.y + this.h > player.y){
					this.gone = true;
					//player.shotTimer = player.recharge;
					player.hp -= Math.round(this.strength*this.power/player.defense);
				}
			}
		}
	}
	
	getVisualData(){
		return {
			x: this.x,
			y: this.y,
			w: this.w,
			h: this.h,
			type: "projectile",
			color: this.color
		};
	}

}
module.exports = Projectile;
