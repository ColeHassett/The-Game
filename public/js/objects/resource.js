const MAX_HP = 5;

class Resource {

	constructor(position) {
		this.health = MAX_HP;
		this.alive = true;
		this.position = position;
	}

	harvest(chance) {
		var success_check = Math.round(Math.random() + (chance/100));
		if (success_check) {
			if (this.health > 1) {
				this.health -= 1;
			} else {
				this.alive = false;
				var self = this;
				setTimeout(function() {
					self.reset();
				}, 5000);
			}
			return true;
		} else {
			return false;
		}
	}

	reset() {
		this.alive = true;
		this.health = MAX_HP;
	}
};

module.exports = Resource;
