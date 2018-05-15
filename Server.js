var express = require('express');
var app = express();
var router = express.Router();
var path = __dirname + '/views/';

var server_port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

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

app.listen(server_port, server_ip_address, function(){
	console.log("Live at Port " + server_port + ", IP: " + server_ip_address);
});

module.exports = app;
