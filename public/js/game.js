var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, 'phaser_canvas', {
	preload: preload,
	create: create,
	update: update
}, false, true, {arcade: true});

// var game = new Phaser.Game(1024, 640, Phaser.AUTO, 'phaser_canvas', {
// 	preload: preload,
// 	create: create,
// 	update: update
// });

var chat_box = document.getElementById("chat_box");
var chat_form = document.getElementById("chat_form");
var chat_input = document.getElementById("chat_input");
var game_div = document.getElementById("phaser_canvas");
var inventory_box = document.getElementById("inventory_box");

var player;
var layer;
var map;
var username;
var inventory = [];

// socket.on('positions', function(data) {
// 	if (player_sprites) {
// 		player_sprites.killAll();
// 	} else {
// 		return;
// 	}
//
// 	for (var i in data) {
// 		player = player_sprites.getFirstDead();
// 		if (player) {
// 			player.reset(data[i].x, data[i].y);
// 			// var name_label = game.add.text(20,20,data[i].name, {font: "200px Arial", fill:"#ffffff"});
// 			// player.addChild(name_label);
// 		} else {
// 			player = game.add.sprite(data[i].x, data[i].y, 'player');
// 			// var name_label = game.add.text(20,20,data[i].name, {font: "200px Arial", fill:"#ffffff"});
// 			// player.addChild(name_label);
// 			player.scale.setTo(0.13, 0.13);
// 			game.physics.enable(player);
// 			player.body.setSize(16 / player.scale.x, 16 / player.scale.y);
// 			game.physics.arcade.enable(player);
// 			player_sprites.add(player)
// 		}
// 	}
// });

// socket.on('drawObjects', function(data){
// 	// for (var i in data) {
// 	// 	var ore = game.add.sprite(data[i].x, data[i].y, 'ore');
// 	// 	game.physics.arcade.enable(ore);
// 	// 	ore.maxHealth = 5;
// 	// 	ore.health = 5;
// 	// 	ore.inputEnabled = true;
// 	// 	ore.events.onInputDown.add(function() {
// 	// 		var damage = Math.floor((Math.random() * 3)) + 1;
// 	// 		this.damage(damage);
// 	// 		//alert("You Hit For " + damage + " Damage");
// 	// 	}, ore);
// 	// 	ore.events.onKilled.add(function() {
// 	// 		// setInterval(function() {
// 	// 		// 	console.log(ore);
// 	// 		// 	ore.revive();
// 	// 		// 	console.log(ore.health);
// 	// 		// }, 10000)
// 	// 		console.log(this);
// 	// 		ore.revive();
// 	// 	}, ore);
// 	// 	ore_sprites.push(ore);
// 	// }
// });

function preload() {

	this.load.tilemap('map', 'public/maps/largemaptest.json', null, Phaser.Tilemap.TILED_JSON);

	this.load.image('ore', 'public/images/rock.gif');
	this.load.image('player', 'public/images/FeelsWowMan.png');
	this.load.image('tiles', 'public/images/basictiles.png');

	this.load.spritesheet('tiles_spritesheet', 'public/images/basictiles.png', 16, 16);

	//game.load.tilemap('map', 'public/maps/map.csv', null, Phaser.Tilemap.CSV);

	//game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
}

function create() {

	var self = this;
	this.socket = io();

	// Center game
	this.scale.pageAlignHorizontally = true;
	this.scale.pageAlignVertically = true;

	this.stage.backgroundColor = '#87CEEB';

	// map = game.add.tilemap('map', 16, 16);
	this.map = this.game.add.tilemap('map');

	this.map.addTilesetImage('basictiles', 'tiles');

	//layer = map.createLayer(0);
	this.base_layer = this.map.createLayer('basemap');
	this.wall_layer = this.map.createLayer('walls');

	this.ore_group = this.add.physicsGroup();
	this.ore_group.inputEnableChildren = true;
	this.trees_group = this.add.physicsGroup();
	this.trees_group.inputEnableChildren = true;

	this.map.createFromObjects('Ore', 64, 'tiles_spritesheet', 63, true, false, this.ore_group);
	this.ore_group.forEach(function(ore) {
		ore.body.immovable = true;
		ore.maxHealth = 5;
		ore.health = 5;
		ore.events.onKilled.add(function() {
			addChatMessage("Obtained 1 ore.");
			addToInventory("2", self);
			ore.exists = true;
			ore.tint = 0xA9A9A9;
			setTimeout(function() {
				ore.revive();
				ore.tint = Phaser.Color.WHITE;
			}, 5000);
		}, this);
	});
	this.ore_group.onChildInputDown.add(function(ore) {
		if (ore.alive) {
			var in_range = checkRange(self.player, ore);
			if (in_range) {
				var hit = Math.round(Math.random());
				ore.damage(hit);
				if (hit) {
					addChatMessage("You chip away at the rock.");
					self.socket.emit("damageResource", {type:"Ore", pos: ore.position, damage: hit});
				}
			} else {
				addChatMessage("Try getting closer.");
			}
		} else {
			addChatMessage("That rock looks all mined up.");
		}
	},this);

	this.map.createFromObjects('Trees', 39, 'tiles_spritesheet', 38, true, false, this.trees_group);
	this.trees_group.forEach(function(tree) {
		tree.body.immovable = true;
		tree.maxHealth = 5;
		tree.health = 5;
		tree.events.onKilled.add(function() {
			addChatMessage("Obtained 1 log.");
			addToInventory("1", self);
			tree.exists = true;
			tree.tint = 0xA9A9A9;
			setTimeout(function() {
				tree.revive();
				tree.tint = Phaser.Color.WHITE;
			}, 5000);
		}, this);
	});
	this.trees_group.onChildInputDown.add(function(tree) {
		if (tree.alive) {
			var in_range = checkRange(self.player, tree);
			if (in_range) {
				var hit = Math.round(Math.random());
				tree.damage(hit);
				if (hit) {
					addChatMessage("You chip away at the tree.");
					self.socket.emit("damageResource", {type:"Trees", pos: tree.position, damage: hit});
				}
			} else {
				addChatMessage("Try getting closer.");
			}
		} else {
			addChatMessage("That tree looks chopped down.");
		}
	},this);

	for (var set in this.map.objects) {
		console.log(this.map.objects[set]);
	}

	this.socket.emit("createObjectsOnServer", this.map.objects);

	this.map.setCollisionBetween(1, 20, true, 'walls');

	this.base_layer.resizeWorld();

	//this.physics.startSystem(Phaser.Physics.ARCADE);

	this.keys = this.input.keyboard.addKeys({
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

	// socket work
	this.player_sprites = this.add.group();

	// this.socket.on('displayName', function(data) {
	// 	var greeting = document.getElementById('greeting');
	// 	greeting.innerHTML += data.name;
	// });

	this.socket.on('currPlayers', function(data) {
		Object.keys(data).forEach(function(id) {
			if (data[id].socket_id === self.socket.id) {
				addPlayer(self, data[id]);
			} else {
				addOtherPlayers(self, data[id]);
			}
		})
	});

	this.socket.on('newPlayer', function(data) {
		addOtherPlayers(self, data);
	});

	this.socket.on('updatePlayerLocations', function(player_list) {

		for (var i in self.player_sprites.getAll()) {
			var other_player = self.player_sprites.getChildAt(i);
			for (var player in player_list) {
				if (player_list[player].socket_id === other_player.id) {
					other_player.target_x = player_list[player].x;
					other_player.target_y = player_list[player].y;
				}
			}
		}
		// self.player_sprites.getAll().forEach(function(other_player) {
		// 	console.log(data.socket_id);
		// 	console.log(other_player.id);
		// 	if (data.socket_id === other_player.id) {
		// 		other_player.reset(data.x, data.y);
		// 	}
		// })
	});

	this.socket.on('disconnect', function(id) {
		self.player_sprites.getAll().forEach(function(other_player) {
			if (id === other_player.id) {
				other_player.destroy();
			}
		});
	});

	this.socket.on('addToChat', function(data) {
		addChatMessage(data);
	});

	// chat functionality
	chat_form.onsubmit = function(e) {
		e.preventDefault();

		self.socket.emit("sendChatMsg", chat_input.value);
		chat_input.value = "";
	}
	game_div.onclick = function() {
		game_div.focus();
		chat_input.blur();
		game.input.enabled = true;
		chat_box.style.opacity = "0.5";
	}
	chat_box.onclick = function() {
		chat_input.focus();
		game.input.enabled = false;
		chat_box.style.opacity = "1";
	}
	chat_form.onclick = function() {
		chat_input.focus();
		game.input.enabled = false;
		chat_box.style.opacity = "1";
	}

}

function update() {

	var self = this;

	resizeGame();

	if (this.player) {

		this.player.body.velocity.y = 0;
		this.player.body.velocity.x = 0;

		var did_move = false;

		if (this.keys.up.isDown || this.keys.W.isDown) {
			this.player.body.velocity.y -= this.player.body.maxVelocity;
			did_move = true;
		} else if (this.keys.down.isDown || this.keys.S.isDown) {
			this.player.body.velocity.y += this.player.body.maxVelocity;
			did_move = true;
		}
		if (this.keys.left.isDown || this.keys.A.isDown) {
			this.player.body.velocity.x -= this.player.body.maxVelocity;
			did_move = true;
		} else if (this.keys.right.isDown || this.keys.D.isDown) {
			this.player.body.velocity.x += this.player.body.maxVelocity;
			did_move = true;
		}

		if (did_move) {
			this.socket.emit('playerMoved', {x: this.player.x, y: this.player.y});
		}

		// var x = this.player.x;
		// var y = this.player.y;
		// if (this.player.old_position && (x !== this.player.old_position.x || y !== this.player.old_position.y)) {
		// 	this.socket.emit('playerMoved', {x: this.player.x, y: this.player.y});
		// }
		//
		// this.player.old_position = {
		// 	x: this.player.x,
		// 	y: this.player.y
		// }
	}

	for (var i in this.player_sprites.getAll()) {
		var other_player = this.player_sprites.getChildAt(i);
		if (other_player.target_x != undefined) {
			if (other_player.target_x !== other_player.x) {
				if ((other_player.x + 5) > other_player.target_x) {
					other_player.x += other_player.target_x - other_player.x;
				} else {
					other_player.x += 5;
				}
			}
			if (other_player.target_y !== other_player.y) {
				if ((other_player.y + 5) > other_player.target_y) {
					other_player.y += other_player.target_y - other_player.y;
				} else {
					other_player.y += 5;
				}
			}
			// while (other_player.target_x.toFixed(0) !== other_player.x.toFixed(0) && other_player.target_y.toFixed(0) !== other_player.y.toFixed(0)) {
			// 	if (other_player.target_x.toFixed(0) !== other_player.x.toFixed(0)) {
			// 		other_player.x += 1;
			// 	}
			// 	if (other_player.target_y.toFixed(0) !== other_player.y.toFixed(0)) {
			// 		other_player.y += 1;
			// 	}
			// 	other_player.x += 1;
			// 	other_player.y += 1;
			// }
			// other_player.x += (other_player.target_x - other_player.x) * 0.16;
			// other_player.y += (other_player.target_y - other_player.y) * 0.16;
		}
	}

	//collision
	this.game.physics.arcade.collide(this.player, this.wall_layer);
	this.game.physics.arcade.collide(this.player, this.ore_group, function (player, ore) {
		// chat_box.innerHTML += "<div>You mine some ore.</div>";
		// chat_box.scrollTop = chat_box.scrollHeight;
	});
	this.game.physics.arcade.collide(this.player, this.trees_group, function(player, tree) {
		// chat_box.innerHTML += "<div>You chop some wood.</div>";
		// chat_box.scrollTop = chat_box.scrollHeight;
	});

	// // Move Player
	// if (this.keys.up.isDown || this.keys.W.isDown) {
	// 	socket.emit('keypress', {direction: 'up', state: true, map_height: game.world.height, map_width: game.world.width});
	// 	//socket.emit('keypress', {direction: 'up', state: true});
	// } else if (this.keys.down.isDown || this.keys.S.isDown) {
	// 	socket.emit('keypress', {direction: 'down', state: true, map_height: game.world.height, map_width: game.world.width});
	// }
	// if (this.keys.left.isDown || this.keys.A.isDown) {
	// 	socket.emit('keypress', {direction: 'left', state: true, map_height: game.world.height, map_width: game.world.width});
	// } else if (this.keys.right.isDown || this.keys.D.isDown) {
	// 	socket.emit('keypress', {direction: 'right', state: true, map_height: game.world.height, map_width: game.world.width});
	// }
	//
	// // Stop Player
	// if (this.keys.up.isUp && this.keys.W.isUp) {
	// 	socket.emit('keypress', {direction: 'up', state: false});
	// }
	// if (this.keys.down.isUp && this.keys.S.isUp) {
	// 	socket.emit('keypress', {direction: 'down', state: false});
	// }
	// if (this.keys.left.isUp && this.keys.A.isUp) {
	// 	socket.emit('keypress', {direction: 'left', state: false});
	// }
	// if (this.keys.right.isUp && this.keys.D.isUp) {
	// 	socket.emit('keypress', {direction: 'right', state: false});
	// }

	// if (this.keys.P.justDown) {
	// 	console.log(game.world.width);
	// 	console.log(game.world.height);
	// 	console.log(ore_sprites);
	// }

}

function addPlayer(self, player_info) {
	self.player = self.add.sprite(player_info.x, player_info.y, 'player');
	self.player.name = player_info.name;
	self.player.scale.setTo(0.4, 0.4);
	self.physics.arcade.enable(self.player);
	self.player.body.setSize(16 / self.player.scale.x, 16 / self.player.scale.y);
	self.player.body.maxVelocity = player_info.speed;
	self.camera.follow(self.player);

	addToInventory(player_info.inventory, self);

	// var name_label = game.add.text(0,0,player_info.name, {font: "200px Arial", fill:"#ffffff"});
	// self.player.addChild(name_label);
}

function addOtherPlayers(self, player_info) {
	const other_player = self.add.sprite(player_info.x, player_info.y, 'player');
	other_player.name = player_info.name;
	other_player.scale.setTo(0.4, 0.4);
	self.physics.arcade.enable(other_player);
	other_player.body.setSize(16 / other_player.scale.x, 16 / other_player.scale.y);
	other_player.id = player_info.socket_id;
	other_player.body.maxVelocity = player_info.speed;

	// var name_label = game.add.text(0,0,player_info.name, {font: "200px Arial", fill:"#ffffff"});
	// other_player.addChild(name_label);

	self.player_sprites.add(other_player);
}

function checkRange(player, sprite) {
	var x_distance = player.x - sprite.x;
	var y_distance = player.y - sprite.y;

	if (x_distance > -17 && x_distance < 17 && y_distance > -17 && y_distance < 17) {
		return true;
	} else {
		return false;
	}
}

function addChatMessage(msg) {
	chat_box.innerHTML += "<div>"+msg+"</div>";
	chat_box.scrollTop = chat_box.scrollHeight;
}

function addToInventory(items, self) {

	// 83 pickaxe
	// 86 wood axe
	// 42 ore
	// 70 logs

	for (var item in items) {
		this.inventory.push(items[item]);
		var image_tag = retrieveItemImage(items[item]);
		this.inventory_box.innerHTML += " "+image_tag;
	}
	self.socket.emit('updateInventory', this.inventory);
}

function retrieveItemImage(item_id) {

	switch(item_id) {
		case "1":
			return "<img class='log_image' src='../images/transparent.png'>";
		case "2":
			return "<img class='ore_image' src='../images/transparent.png'>";
		case "3":
			return "<img class='axe_image' src='../images/transparent.png'>";
		case "4":
			return "<img class='pickaxe_image' src='../images/transparent.png'>";
		default:
			break;
	}
}

function resizeGame() {

	let width = window.innerWidth;
	let height = window.innerHeight;
	game.camera.setSize(width, height);
}
