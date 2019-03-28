c = document.querySelector("#gameField");
c.style.border = "1px solid";
c.style.backgroundColor = "#AAAAAA";
c.setAttribute('tabindex', 0);
log = document.querySelector("#dataLog");
f = c.getContext('2d');
keyList = [];

c.onkeydown = (event)=>{
	let key = event.which || event.charCode;
	keyList[key] = true;
	socket.emit('keylist_update', keyList);
	console.log('down');
}

c.onkeyup = (event)=>{
	let key = event.which || event.charCode;
	keyList[key] = false;
	socket.emit('keylist_update', keyList);
	console.log('up');
}

draw = (data)=>{
	if(data === null){
		return;
	}
	//console.log(data.data.selfData);
	visualData = data.data;
	f.clearRect(0, 0, c.width, c.height);
	let {x, y, w, h, hp, time} = visualData.selfData;
	let bounds = [x + w/2 - c.width/2, x + w/2 + c.width/2, 
					y + h/2 - c.height/2, y + h/2 + c.height/2];
	f.fillStyle = "white";
	f.fillRect(-1*bounds[0], -1*bounds[2], field.width, field.height);
	f.strokeStyle = "#BBBBBB";
	f.lineWidth = 1;
	for(let i=0;i<field.height;i+=50){
		f.beginPath();
		f.moveTo(-1*bounds[0], -1*bounds[2] + i);
		f.lineTo(-1*bounds[0]+field.width, -1*bounds[2] + i);
		f.stroke();
		f.closePath();
	}
	for(let i=0;i<field.width;i+=50){
		f.beginPath();
		f.moveTo(-1*bounds[0] + i, -1*bounds[2]);
		f.lineTo(-1*bounds[0] + i, -1*bounds[2]+field.height);
		f.stroke();
		f.closePath();
	}
	if(!visualData.selfData.dead){
		f.fillStyle = visualData.selfData.color;
		f.fillRect(c.width/2 - w/2, c.height/2 - h/2, w, h);
		f.fillStyle = "#339933";
		f.fillRect(c.width/2 - w/2, c.height/2 - h/2, w*hp, 5);
		f.fillStyle = "#333399";
		f.fillRect(c.width/2 - w/2, c.height/2 + h/2 - 5, w*time, 5);
	}
	for(let entry of visualData.list){
		switch(entry.type){
			case 'player':
				if(!entry.dead){
					f.fillStyle = entry.color;
					f.fillRect(entry.x - x + c.width/2 - w/2, entry.y - y + c.height/2 - h/2, entry.w, entry.h);
					f.font = "16px Courier";
					f.fillText(entry.name, entry.x - x + c.width/2 - w/2, entry.y - y + c.height/2 - h/2 - 5);
				}
				break;
			case 'projectile':
				f.fillStyle = entry.color;
				f.fillRect(entry.x - x + c.width/2 - w/2, entry.y - y + c.height/2 - h/2, entry.w, entry.h);
				break;
			default:
				break;
		}
	}
	log.innerText = `x: ${x}
	y: ${y}`;
}

loop = setInterval(()=>{draw(gamedata)}, 1000/30);
