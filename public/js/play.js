var socket = io();
var ctx = document.getElementById("ctx").getContext("2d");

socket.on('positions', function(data) {
	ctx.clearRect(0,0,500,500);
	for (var i in data) {
		var img = document.createElement('img');
		img.src = "public/images/FeelsWowMan.png";
		ctx.fillText("Name", data[i].x, data[i].y);
		ctx.drawImage(img,data[i].x,data[i].y);
	}
});

document.onkeydown = function(event) {
	if (event.keyCode == 68) { // d
		socket.emit('keypress', {direction: 'right', state: true});
	} else if (event.keyCode == 83) { // s
		socket.emit('keypress', {direction: 'down', state: true});
	} else if (event.keyCode == 65) { // a
		socket.emit('keypress', {direction: 'left', state: true});
	} else if (event.keyCode == 87) { // w
		socket.emit('keypress', {direction: 'up', state: true});
	}
}

document.onkeyup = function(event) {
	if (event.keyCode == 68) { // d
		socket.emit('keypress', {direction: 'right', state: false});
	} else if (event.keyCode == 83) { // s
		socket.emit('keypress', {direction: 'down', state: false});
	} else if (event.keyCode == 65) { // a
		socket.emit('keypress', {direction: 'left', state: false});
	} else if (event.keyCode == 87) { // w
		socket.emit('keypress', {direction: 'up', state: false});
	}
}
