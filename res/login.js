button = document.querySelector("button");
button.onclick = ()=>{
	let data = document.getElementById("nameIn").value;
	//console.log(data);
	socket.emit("new_user", JSON.parse(data));	
}
socket.on('user_accepted', (state)=>{
	if(state === 0){
		socket.emit('request_location_change', 'lobby');
	} else {
		socket.emit('request_location_change', 'waiting');
	}
});
