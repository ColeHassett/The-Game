/**
 * Server functionality
 */

// Requires and modules
var express = require('express');
var app = express();
var body_parser = require('body-parser');
var multer = require('multer');
var upload = multer();
var mongoose = require('mongoose');
var crypto = require('crypto');
var cookie_parser = require('cookie-parser');
var session = require('express-session');
var serv = require('http').Server(app);
var io = require('socket.io')(serv);

// Path to pug views
var path = __dirname + '/views/';

// Port and IP to open for connections
var server_port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
var connection_string = process.env.USERDOMAIN != "Cactopus" ? "mongodb://admin:<RustMost6>@the-game-shard-00-00-x2kdw.gcp.mongodb.net:27017,the-game-shard-00-01-x2kdw.gcp.mongodb.net:27017,the-game-shard-00-02-x2kdw.gcp.mongodb.net:27017/test?ssl=true&replicaSet=the-game-shard-0&authSource=admin&retryWrites=true" : 'localhost';

// Connect to mongo DB and setup collections
mongoose.connect('mongodb://'+connection_string+':27017/');
// Schema and model for player queries
var playerSchema = mongoose.Schema({
	username: String,
	password: String,
	salt: String,
	x: Number,
	y: Number,
	speed: Number,
	inventory: Array
});
var Player_Model = mongoose.model("Player", playerSchema);
// Schema and model for item queries
var itemSchema = mongoose.Schema({
	name: String,
	image: String
});
var Item_Model = mongoose.model("Items", itemSchema);
// Schema and model for object queries
var objectSchema = mongoose.Schema({
	name: String,
	drops: Array,
	drop_chance: Array
});
var Object_model = mongoose.model("Objects", objectSchema);

/**
 * GET methods
 */

app.get('/', function(req, res){
	res.render(path + "login.pug");
});

app.get('/patch', function(req, res) {
	res.render(path + "patch.pug");
});

// app.get('/process', function(req, res){
// 	res.json(process.env);
// });

// app.get('/game', function(req, res){
// 	res.sendFile(__dirname + "/game.html");
// });

app.get('/sprite', function(req, res){
	res.render(path + "spritetest.pug");
});

// Set pug as templating engine
app.set('view engine', 'pug');
app.set('views', './views');

// Tell express to use this stuff
app.use(body_parser.json());
app.use(body_parser.urlencoded({extended: true}));
app.use(upload.array());
app.use(cookie_parser());
app.use(session({secret: "super secret"}));

app.use("/public", express.static(__dirname + "/public"));

/**
 * Socket functionality
 */
// Player.setCoords = function (socket, data) {
// 	for (var i in Player.list) {
// 		var player = Player.list[i];
// 		if (player.id = socket.id) {
// 			player.x = data.x;
// 			player.y = data.y;
// 		}
// 	}
// }

var Player = function(socket_id, player_data) {
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
Player.onConnect = function (socket, player_data) {

	var player = new Player(socket.id, player_data);
	socket.emit('displayName', {name: player.name});

	socket.emit('currPlayers', Player.list);

	socket.broadcast.emit('newPlayer', Player.list[socket.id]);

	socket.on('sendChatMsg', function(msg) {
		for (var i in CONNECTIONS) {
			var tempSocket = CONNECTIONS[i];
			tempSocket.emit('addToChat', player.name+": "+msg);
		}
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

Player.list = {};

var CONNECTIONS = {};
var temp_player;

io.on('connection', function(socket) {

	CONNECTIONS[socket.id] = socket;

	if (temp_player) {
		Player.onConnect(socket, temp_player);
		console.log("Connected: "+socket.id);
	}

	socket.on("disconnect", function() {
		delete CONNECTIONS[socket.id];
		delete Player.list[socket.id];

		console.log("Disconnected: "+socket.id);

		io.emit('disconnect', socket.id);
	});

});

setInterval(function() {

	for (var i in CONNECTIONS) {
		var socket = CONNECTIONS[i];
		socket.emit('updatePlayerLocations', Player.list);
	}

	// var positions = Player.update();
	//
	// for (var i in CONNECTIONS) {
	// 	var socket = CONNECTIONS[i];
	// 	socket.emit('positions', positions);
	// }
}, 1000/30);

/**
 * POST methods
 */

app.post('/createaccount', function(req, res) {
	var player_info = req.body;

	if (!player_info.username || !player_info.password || !player_info.confirm_password) {
		res.render(path + "sign_up.pug", {message: "Please fill out all fields", type: "error"});
	} else if (player_info.password != player_info.confirm_password){
		res.render(path + "sign_up.pug", {message: "Passwords do not match", type: "error", username: player_info.username});
	} else {
		Player_Model.findOne({username: player_info.username}, function(err, user) {
			if (err) {
				res.render(path + "sign_up.pug", {message: "Database Error", type: "error", username: player_info.username});
			}

			if (user) {
				res.render(path + "sign_up.pug", {message: "Username is Taken", type: "error"});
			} else {
				var salt = crypto.randomBytes(64).toString('hex');
				var hash = crypto.pbkdf2Sync(player_info.password, salt, 10000, 64, 'sha512').toString('hex');

				var new_player = new Player_Model({
					username: player_info.username,
					password: hash,
					salt: salt,
					x: 20,
					y: 20,
					speed: 200,
					inventory: [3, 4]
				});

				new_player.save(function(err, Player_Model) {
					if (err) {
						res.render(path + "sign_up.pug", {message: "Database Error", type: "error", username: player_info.username});
					} else {
						res.render(path + "login.pug", {message: "Account Created. Please Login.", type: "success"});
					}
				});
			}
		});
	}
});

app.post('/signup', function(req, res) {
	res.render(path + "sign_up.pug");
});

app.post('/login', function(req, res) {
	var player_info = req.body;

	if (!player_info.username || !player_info.password) {
		res.render(path + "login.pug", {message: "Please Fill Out All Fields", type: "error", username: player_info.username});
	} else {
		Player_Model.findOne({username: player_info.username}, function(err, user) {
			if (err) {
				res.render(path + "login.pug", {message: "Database Error", type: "error", username: player_info.username});
			}

			if (user) {
				var hash = crypto.pbkdf2Sync(player_info.password, user.salt, 10000, 64, 'sha512').toString('hex');
				if (hash == user.password) {
					req.session.user = user;
					res.redirect("/game");
					//res.render(path + "game.pug", {username: user.username});
				} else {
					res.render(path + "login.pug", {message: "Invalid Password", type: "error", username: player_info.username});
				}
			} else {
				res.render(path + "login.pug", {message: "User Does Not Exist", type: "error", username: player_info.username});
			}
		});
	}
});

app.get('/game', function(req, res) {
	var user = req.session.user;
	temp_player = {
		id: user._id,
		username: user.username,
		x: user.x,
		y: user.y,
		speed: user.speed,
		inventory: user.inventory
	}
	res.render(path+"game.pug");

	// io.on('connection', function(socket) {
	// 	socket.id = Math.random();
	// 	CONNECTIONS[socket.id] = socket;
	//
	// 	Player.onConnect(socket, player_data);
	//
	// 	socket.on("disconnect", function() {
	// 		delete CONNECTIONS[socket.id];
	// 		Player.onDisconnect(socket);
	// 	});
	//
	// });
});

function checkSignIn(req, res) {
	if (req.session.user) {
		next();
	}
	else {
		var err = new Error("Not Logged in.");
		console.log(req.sessions.user);
		next(err);
	}
}

app.post('/', function(req, res) {
	res.render(path + "login.pug");
});

// Error Checking [MUST BE LAST]
app.use("*",function(req,res){
	res.send("Invalid URL");
});

// Open server on specified port and IP
serv.listen(server_port, server_ip_address, function(){
	console.log("Live at Port " + server_port + ", IP: " + server_ip_address);
});

module.exports = app;
