/**
 * A JS FILE
 */

var feels_wow = "public/images/FeelsWowMan.png";
var feels_bad = "public/images/FeelsBadMan.png";
var rock_image = "public/images/rock.png";
var rock_mine_image = "public/images/rock.gif";
var start_image;
var end_image;

var play_button;
var increase_ore_button;
var remake_board_button;

var points_text;
var total_trips_text;
var notify_player_text;

var playing = false;
var count = 0;
var total_count = 0;
var ore_chance = 0.8;
var board_ore_count = 0;
var timeout;
var points;

function loadGame() {

	play_button = document.createElement("input");
	play_button.id = "play_button";
	play_button.type = "button";
	play_button.value = "Play";
	play_button.addEventListener("click", function() {
		playGame();
	});

	increase_ore_button = document.createElement("input");
	increase_ore_button.id = "increase_ore_button";
	increase_ore_button.type = "button";
	increase_ore_button.value = "Increase Ore Chance (Cost: 50 Ore)";
	increase_ore_button.addEventListener("click", function() {
		if (points > 50 && ore_chance > 0.1) {
			ore_chance -= 0.1;
			points -= 50;
			notify_player_text.innerHTML += "<br>Ore Spawn Chance is Now " + Math.ceil((1 - ore_chance) * 100) + "%";
			points_text.innerHTML = "Ore: " + points;
			createGameBoard();
		} else if (ore_chance < 0.1) {
			notify_player_text.innerHTML += "<br>You've Maxed the Spawn Chance!";
		} else {
			notify_player_text.innerHTML += "<br>Not Enough Points";
		}
	});

	remake_board_button = document.createElement("input");
	remake_board_button.id = "remake_board_button";
	remake_board_button.type = "button";
	remake_board_button.value = "Remake Board (Cost: 5 Ore)";
	remake_board_button.addEventListener("click", function() {
		if (points > 5) {
			createGameBoard();
			points -= 5;
			points_text.innerHTML = "Ore: " + points;
		}
		else {
			notify_player_text.innerHTML += "<br>Not Enough Points";
		}
	});

	start_image = document.createElement("img");
	start_image.id = "start_image";
	start_image.style.visibility = "visible";
	start_image.height = "100";
	start_image.width = "100";
	start_image.src = feels_wow;

	points_text = document.createElement("p");
	points = points == undefined ? 0 : points;
	points_text.innerHTML = "Ore: " + points;

	total_trips_text = document.createElement("p");
	total_trips_text.innerHTML = "Total Trips: " + total_count;

	notify_player_text = document.createElement("h1");
	notify_player_text.innerHTML = "Click Play to Start Mining";

	document.body.appendChild(notify_player_text);
	document.body.appendChild(start_image);
	document.body.appendChild(document.createElement("br"));
	document.body.appendChild(play_button);
	document.body.appendChild(increase_ore_button);
	document.body.appendChild(remake_board_button);
	document.body.appendChild(points_text);
	document.body.appendChild(total_trips_text);

	createGameBoard();

}

function playGame() {

	if (board_ore_count < 1) {
		createGameBoard();
	}

	if (playing) {
		playing = false;
		play_button.value = "Play";
		window.clearTimeout(timeout);
		count = 0;
		start_image.style.visibility = "visible";
		end_image.src = rock_image;
		end_image.className = "rock";
	} else {
		playing = true;
		play_button.value = "Quit";
	}

	switchImage();
}

function switchImage() {

	if (count > 4) {
		playing = false;
		play_button.value = "Play";
		count = 0;
	}

	if (playing) {
		if (start_image.style.visibility == "visible") {
			timeout = setTimeout(function() {
				start_image.style.visibility = "hidden";
				var moveToId = (Math.floor(Math.random() * 10)) +"_"+(Math.floor(Math.random() * 10));
				end_image = document.getElementById(moveToId);
				end_image.src = feels_bad;
				switchImage();
			}, 1000);
		} else {
			timeout = setTimeout(function() {
				start_image.style.visibility = "visible";
				count += 1;
				total_count += 1;
				addPoints();
				switchImage();
			}, 1000);
		}
	} else {
		return;
	}

}

function addPoints() {

	if (end_image.className == "rock_mine") {
		var ore_mined = Math.floor(Math.random() * 3) + 1;
		points += ore_mined;
		board_ore_count--;
		points_text.innerHTML = "Ore: " + points;
		notify_player_text.innerHTML = "You Received " + ore_mined + " Ore On Your Trip";
		end_image.src = rock_image;
		end_image.className = "rock";
	}
	else {
		notify_player_text.innerHTML = "You Received No Ore On Your Trip";
		end_image.src = rock_image;
	}
	total_trips_text.innerHTML = "Total Trips: " + total_count;
}

function createGameBoard() {

	var check_board_exist = document.getElementById("image_grid");
	if (check_board_exist) {
		check_board_exist.remove();
	}

	var container = document.createElement("div");
	container.id = "image_grid";

	for (var i = 0; i < 10; i++) {

		var row = document.createElement("div");
		row.className = "row";

		for (var j = 0; j < 10; j++) {

			var image = document.createElement("img");
			image.id = i+"_"+j;

			if (Math.random() > ore_chance) {
				image.src = rock_mine_image;
				image.className = "rock_mine";
				// image.addEventListener("click", function() {
				// 	end_image = this;
				// 	addPoints();
				// });
				board_ore_count++;
			} else {
				image.src = rock_image;
				image.className = "rock";
			}

			row.appendChild(image);
		}
		container.appendChild(row);
	}
	var header = document.createElement("h2");
	header.style.textDecoration = "underline";
	header.innerHTML = "The Mines";
	document.body.appendChild(document.createElement("hr"));
	document.body.appendChild(header);
	document.body.appendChild(container);
}
