let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let readline = require('readline');
const Player = require("./player.js");
const Game = require("./game.js");

app.use(express.static('res'));

let state = 0;
let players = new Map();

let field = {width: 1000, height: 1000};

let pageData = new Map();
pageData.set('login', '');
pageData.set('lobby', [field]);
pageData.set('waiting', []);
pageData.set('game', {});
pageData.set('winner', []);

let game = new Game(field);
let loop = null;
let winners = [];

let reader = readline.createInterface(process.stdin, process.stdout);
reader.on('line', (line)=>{
	if(io.sockets.adapter.rooms['lobby'] !== undefined && 
		io.sockets.adapter.rooms['lobby'].length > 1 && state === 0 && line === "start"){
		state = 1;
		for(let [key, entry] of players.entries()){
			if(entry.loc !== 'login'){
				entry.loc = 'game';
			}
			broadcastLocationChange(io.sockets.connected[key]);
		}
		winners = [];
		game.initialize(players);
		let loop = setInterval(serverLoop, 1000/30);
	} else if(players.size > 1 && state === 2 && line === "restart"){
		state = 1;
		for(let [key, entry] of players.entries()){
			if(entry.loc !== 'login'){
				entry.loc = 'game';
			}
			broadcastLocationChange(io.sockets.connected[key]);
		}
		winners = [];
		game.initialize(players);
	} else {
		console.log("Invalid input");
	}	
});

function serverLoop(){
	if(state === 1){
		game.loop();
		let visuals = game.getVisualData();
		for(let player of players.values()){
			player.visuals = {selfData: null, list: []};
		}
//		console.log(visuals);
		for(let entry of visuals){
			let x = entry.x, y = entry.y;
			for(let id of game.players.keys()){
				let threshold = players.get(id).drawDistance;
				let player = game.players.get(id);
				if(entry.id === id){
					players.get(id).visuals.selfData = entry;
				} else {
					let px = player.x+player.w/2, py = player.y+player.h/2;
					if( Math.sqrt( (px-x)**2 + (py-y)**2 ) < threshold ){
						players.get(id).visuals.list.push(entry);
					}
				}
			}
		}
		winners = [];
		for(let id of game.players.keys()){
			broadcastLocationUpdate('game', io.sockets.connected[id], players.get(id).visuals);
		}	
		if(game.survivors === 2){
			for(let player of game.players.values()){
				if(!player.gone){
					winners.push(player.id);
				}
			}
		}
		winners = [];
		if(game.survivors === 1){
			for(let player of game.players.values()){
				if(!player.gone){
					winners.push(player.id);
				}
			}
			state = 2;
			pageData.set('winner', winners.map( (v)=>players.get(v).player.name  ));
			for(let id of game.players.keys()){
				players.get(id).loc = 'winner';
				broadcastLocationChange(io.sockets.connected[id]);
			}
		} else if(game.survivors === 0){
			state = 2;
			pageData.set('winner', winners.map( (v)=>players.get(v).player.name  ));
			for(let id of game.players.keys()){
				players.get(id).loc = 'winner';
				broadcastLocationChange(io.sockets.connected[id]);
			}	
		}
	} else {
		clearInterval(loop);
	}
}

app.all('/', (req, res)=>{
	res.sendFile(__dirname + "/index.html");
});


function broadcastLocationChange(socket){
	let player = players.get(socket.id);
	socket.leaveAll();
	socket.join(player.loc);
	socket.emit('location_change', 
		{loc: player.loc, data: pageData.get(player.loc)});
}

function broadcastLocationUpdate(loc, socket=null, info=null){
	if(socket === null){
		io.in(loc).emit('location_update', {loc: loc, data: pageData.get(loc)});
	} else {
		if(loc === 'game'){
			socket.emit('location_update', {loc: loc, data: info});
		} else {
			socket.to(loc).emit('location_update', {loc: loc, data: pageData.get(loc)});
		}
	}
}

io.on('connection', (socket)=>{
	console.log('User connected');
	players.set(socket.id, {loc: 'login', player: null, visuals: [], drawDistance: 400});
	broadcastLocationChange(socket);
	
	socket.on('new_user', (data)=>{
		players.get(socket.id).player = data;
		if(state === 0){
			pageData.get('lobby').push(data.name);
		} else {
			pageData.get('waiting').push(data.name);
		}
		socket.emit('user_accepted', state);
		//console.log(players);
	});
	socket.on('request_location_change', (loc)=>{
		players.get(socket.id).loc = loc;
		broadcastLocationChange(socket);
		broadcastLocationUpdate(loc, socket);
	});
	socket.on('keylist_update', (keyList)=>{
		game.players.get(socket.id).keyList = keyList;
	});
	socket.on('disconnect', (s)=>{
		let id = socket.id;
		let loc = players.get(id).loc;
		if(players.get(id).loc === 'lobby'){
			let data = pageData.get('lobby');
			for(let i=0;i<data.length;i++){
				if(data[i] === players.get(id).player){
					data.splice(i, 1);
					break;
				}
			}
		}
		players.delete(id);
		console.log('User disconnected');
		console.log(players);
		broadcastLocationUpdate(loc);
	});
});

http.listen( (process.env.PORT || 8080), ()=>{
	console.log('Main page working');
});
