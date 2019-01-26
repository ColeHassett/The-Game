var Player = function(socket_id, player_data, Player_Model) {
	var self = {
		x: player_data.x,
		y: player_data.y,
		id: player_data.id,
		socket_id: socket_id,
		name: player_data.username,
		moveRight: false,
		moveLeft: false,
		moveUp: false,
		moveDown: false,
		speed: player_data.speed,
		inventory: player_data.inventory
	}
	self.updatePosition = function() {
		if (self.moveRight) {
			self.x += self.speed;
		} else if (self.moveLeft) {
			self.x -= self.speed;
		}
		if (self.moveUp) {
			self.y -= self.speed;
		} else if (self.moveDown) {
			self.y += self.speed;
		}

		Player_Model.findOneAndUpdate({username: self.name}, {x: self.x, y: self.y}, {}, function(err, user) {
			if (err) {
				console.log(err);
			}
		});
	}
	Player.list[socket_id] = self;
	return self;
}

Player.list = {};

Player.onConnect = function (socket, player_data, Player_Model) {

	var player = new Player(socket.id, player_data, Player_Model);
	socket.emit('displayName', {name: player.name});

	socket.emit('currPlayers', Player.list);

	socket.broadcast.emit('newPlayer', Player.list[socket.id]);

	socket.on('sendChatMsg', function(msg) {
		socket.broadcast.emit('addToChat', player.name+": "+msg);
		socket.emit('addToChat', player.name+": "+msg);
		// for (var i in Player.list) {
		// 	console.log(Player.list[i].name);
		// 	var tempSocket = Player.list[i].socket_id;
		// 	tempSocket.emit('addToChat', player.name+": "+msg);
		// }
	});

	socket.on('playerMoved', function(data) {
		player.x = data.x;
		player.y = data.y;

		Player_Model.findOneAndUpdate({username: player.name}, {x: player.x, y: player.y}, {}, function(err, user) {
			if (err) {
				console.log(err);
			}
		});

		//socket.broadcast.emit('updatePlayerLocations', Player.list);

		// switch (data.direction) {
		// 	case 'right':
		// 		if (player.x >= (data.map_width - 36)) {
		// 			player.moveRight = false;
		// 		} else {
		// 			player.moveRight = data.state;
		// 		}
		// 		break;
		// 	case 'left':
		// 		if (player.x <= 20) {
		// 			player.moveLeft = false;
		// 		} else {
		// 			player.moveLeft = data.state;
		// 		}
		// 		break;
		// 	case 'up':
		// 		if (player.y <= 20) {
		// 			player.moveUp = false;
		// 		} else {
		// 			player.moveUp = data.state;
		// 		}
		// 		break;
		// 	case 'down':
		// 		if (player.y >= (data.map_height - 36)) {
		// 			player.moveDown = false;
		// 		} else {
		// 			player.moveDown = data.state;
		// 		}
		// 		break;
		// 	default:
		// 		break;
		// }
	});

	socket.on('updateInventory', function(data) {
		player.inventory = data;

		Player_Model.findOneAndUpdate({username: player.name}, {inventory: player.inventory}, {}, function(err, user) {
			if (err) {
				console.log(err);
			}
		})
	});
}

Player.update = function () {
	var positions = [];
	for (var i in Player.list) {
		var player = Player.list[i];
		player.updatePosition();
		positions.push({
			x: player.x,
			y: player.y,
			name: player.name
		});
	}
	return positions;
}

module.exports = Player;
