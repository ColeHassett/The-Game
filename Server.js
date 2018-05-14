var express = require('express');
var app = express();
var router = express.Router();
var path = __dirname + '/views/';

router.get('/', function(req, res){
	res.sendFile(path + "index.html");
});

router.get('/game.html', function(req, res){
	res.sendFile(path + "game.html");
});

app.use("/public", express.static(__dirname + "/public"));

app.use("/",router);

// Error Checking
// app.use("*",function(req,res){
// 	res.sendFile(path + "404.html");
// });

app.listen(3000,function(){
	console.log("Live at Port 3000");
});
