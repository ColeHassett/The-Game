
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var dwarf_miner = "public/images/DwarfMiner.png";

var spritesheet = new SpriteSheet(dwarf_miner, 72, 72, 8, 25);
window.requestAnimationFrame(animate);
function animate() {
	window.requestAnimationFrame(animate);
	ctx.clearRect(0,0,150,150);
	spritesheet.update();
	spritesheet.draw(12.5,12.5);
}

function SpriteSheet(path, width, height, speed, endFrame) {

	var image = new Image();
	var framesPerRow;

	var self = this;
	image.onload = function() {
		framesPerRow = Math.floor(image.width / width);
	}
	image.src = path;

	var currentFrame = 2;
	var counter = 0;

	this.update = function() {
		if (counter == (speed - 1)) {
			currentFrame = (currentFrame + 5) % endFrame;
		}
		counter = (counter + 1) % speed;
	}

	this.draw = function(x, y) {
		var row = Math.floor(currentFrame / framesPerRow);
		var col = Math.floor(currentFrame % framesPerRow);
		ctx.drawImage(
			image,
			col * width, row * height,
			width, height,
			x, y,
			width, height
		);
	}
}
