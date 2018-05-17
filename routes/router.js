var express = require('express');
var router = express.Router();

var path = __dirname + '/views/';

router.get('/', function(req, res){
	res.sendFile(path + "login.pug");
});

router.get('/game', function(req, res){
	res.sendFile(path + "game.pug");
});

module.exports = router;
