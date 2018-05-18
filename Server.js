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
var connection_string = process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://localhost:27017';
console.log(connection_string);

// Connect to mongo DB and use player collection
mongoose.connect(connection_string+'/game-db');
var playerSchema = mongoose.Schema({
	username: String,
	password: String,
	salt: String
});
var Player_Model = mongoose.model("Player", playerSchema);

/**
 * GET methods
 */

app.get('/', function(req, res){
	res.render(path + "login.pug");
});

app.get('/process', function(req, res){
	res.process(process.env);
});

// app.get('/game', function(req, res){
// 	res.render(path + "game.pug");
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
app.use("/public", express.static(__dirname + "/public"));

/**
 * Socket functionality
 */
var CONNECTIONS = {};
var Player = function(id) {
	var self = {
		x: 250,
		y: 250,
		id: id,
		name: 'LucasPotato',
		moveRight: false,
		moveLeft: false,
		moveUp: false,
		moveDown: false,
		speed: 10
	}
	self.updatePosition = function() {
		if (self.moveRight) {
			self.x += self.speed;
		} else if (self.moveLeft) {
			self.x -= self.speed;
		} else if (self.moveUp) {
			self.y -= self.speed;
		} else if (self.moveDown) {
			self.y += self.speed;
		}
	}
	Player.list[id] = self;
	return self;
}
Player.list = {};
Player.onConnect = function (socket) {
	var player = new Player(socket.id);

	socket.on('keypress', function(data) {
		switch (data.direction) {
			case 'right':
				player.moveRight = data.state;
				break;
			case 'left':
				player.moveLeft = data.state;
				break;
			case 'up':
				player.moveUp = data.state;
				break;
			case 'down':
				player.moveDown = data.state;
				break;
			default:
				break;
		}
	});
}
Player.onDisconnect = function (socket) {
	delete Player.list[socket.id];
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

io.on('connection', function(socket) {
	socket.id = Math.random();
	CONNECTIONS[socket.id] = socket;

	Player.onConnect(socket);

	socket.on("disconnect", function() {
		delete CONNECTIONS[socket.id];
		Player.onDisconnect(socket);
	});

});

setInterval(function() {
	var positions = Player.update();

	for (var i in CONNECTIONS) {
		var socket = CONNECTIONS[i];
		socket.emit('positions', positions);
	}
}, 1000/25);

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
					salt: salt
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
					res.render(path + "game.pug", {username: user.username});
				} else {
					res.render(path + "login.pug", {message: "Invalid Password", type: "error", username: player_info.username});
				}
			} else {
				res.render(path + "login.pug", {message: "User Does Not Exist", type: "error", username: player_info.username});
			}
		});
	}
});

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
