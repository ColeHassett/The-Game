var socket = io();

var game = new Phaser.Game(848, 640, Phaser.AUTO, 'phaser_canvas', {
	preload: preload,
	create: create,
	update: update
});

var chat_box = document.getElementById("chat_box");
var chat_form = document.getElementById("chat_form");
var chat_input = document.getElementById("chat_input");

var ballCount = 5;
var playerSprites;
var oreSprites = [];
var player;
var layer;
var map;
var username;

socket.on('getPlayerNames', function(data) {
	if (playerSprites) {
		for (player in playerSprites) {

		}
	} else {
		return;
	}
});

socket.on('positions', function(data) {
	if (playerSprites) {
		playerSprites.killAll();
	} else {
		return;
	}

	for (var i in data) {
		player = playerSprites.getFirstDead();
		if (player) {
			player.reset(data[i].x, data[i].y);
			// var name_label = game.add.text(20,20,data[i].name, {font: "200px Arial", fill:"#ffffff"});
			// player.addChild(name_label);
		} else {
			socket.emit('setPlayerName', {name: username});
			player = game.add.sprite(data[i].x, data[i].y, 'player');
			// var name_label = game.add.text(20,20,data[i].name, {font: "200px Arial", fill:"#ffffff"});
			// player.addChild(name_label);
			player.scale.setTo(0.13, 0.13);
			game.physics.enable(player);
			player.body.setSize(16 / player.scale.x, 16 / player.scale.y);
			game.physics.arcade.enable(player);
			playerSprites.add(player)
		}
	}
});

socket.on('addToChat', function(data) {
	chat_box.innerHTML += "<div>"+data+"</div>";
	chat_box.scrollTop = chat_box.scrollHeight;
});

chat_form.onsubmit = function(e) {
	e.preventDefault();

	socket.emit("sendChatMsg", chat_input.value);
	chat_input.value = "";
}

socket.on('drawObjects', function(data){
	// for (var i in data) {
	// 	var ore = game.add.sprite(data[i].x, data[i].y, 'ore');
	// 	game.physics.arcade.enable(ore);
	// 	ore.maxHealth = 5;
	// 	ore.health = 5;
	// 	ore.inputEnabled = true;
	// 	ore.events.onInputDown.add(function() {
	// 		var damage = Math.floor((Math.random() * 3)) + 1;
	// 		this.damage(damage);
	// 		//alert("You Hit For " + damage + " Damage");
	// 	}, ore);
	// 	ore.events.onKilled.add(function() {
	// 		// setInterval(function() {
	// 		// 	console.log(ore);
	// 		// 	ore.revive();
	// 		// 	console.log(ore.health);
	// 		// }, 10000)
	// 		console.log(this);
	// 		ore.revive();
	// 	}, ore);
	// 	oreSprites.push(ore);
	// }
});

function preload() {
	game.load.image('ore', 'public/images/rock.gif');
	game.load.image('player', 'public/images/FeelsWowMan.png');
	game.load.image('tiles', 'public/images/basictiles.png');

	game.load.tilemap('map', 'public/maps/map.csv', null, Phaser.Tilemap.CSV);

	username = document.getElementById('greeting').innerHTML;
	username = username.substring(7);

	//game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
}

function create() {

	// Center game
	game.scale.pageAlignHorizontally = true;
	game.scale.pageAlignVertically = true;

	game.stage.backgroundColor = '#87CEEB';

	map = game.add.tilemap('map', 16, 16);

	map.addTilesetImage('tiles');

	layer = map.createLayer(0);
	layer.resizeWorld();

	game.physics.startSystem(Phaser.Physics.ARCADE);

	playerSprites = game.add.group();

	this.keys = game.input.keyboard.addKeys({
		'up': 38,
		'down': 40,
		'left': 37,
		'right': 39,
		'W': Phaser.KeyCode.W,
		'A': Phaser.KeyCode.A,
		'S': Phaser.KeyCode.S,
		'D': Phaser.KeyCode.D,
		'P': Phaser.KeyCode.P
	});

	socket.emit('getObjectPositions', {
		width: game.world.width,
		height: game.world.height
	});
}

function update() {

	// Move Player
	if (this.keys.up.isDown || this.keys.W.isDown) {
		socket.emit('keypress', {direction: 'up', state: true, map_height: game.world.height, map_width: game.world.width});
		//socket.emit('keypress', {direction: 'up', state: true});
	} else if (this.keys.down.isDown || this.keys.S.isDown) {
		socket.emit('keypress', {direction: 'down', state: true, map_height: game.world.height, map_width: game.world.width});
	}
	if (this.keys.left.isDown || this.keys.A.isDown) {
		socket.emit('keypress', {direction: 'left', state: true, map_height: game.world.height, map_width: game.world.width});
	} else if (this.keys.right.isDown || this.keys.D.isDown) {
		socket.emit('keypress', {direction: 'right', state: true, map_height: game.world.height, map_width: game.world.width});
	}

	// Stop Player
	if (this.keys.up.isUp && this.keys.W.isUp) {
		socket.emit('keypress', {direction: 'up', state: false});
	}
	if (this.keys.down.isUp && this.keys.S.isUp) {
		socket.emit('keypress', {direction: 'down', state: false});
	}
	if (this.keys.left.isUp && this.keys.A.isUp) {
		socket.emit('keypress', {direction: 'left', state: false});
	}
	if (this.keys.right.isUp && this.keys.D.isUp) {
		socket.emit('keypress', {direction: 'right', state: false});
	}

	// game.physics.arcade.collide(playerSprites, playerSprites, function(player1, player2) {
	// 	console.log(player1);
	// 	console.log(player2);
	// }, null, this);

	if (this.keys.P.justDown) {
		console.log(game.world.width);
		console.log(game.world.height);
		console.log(oreSprites);
	}

}
