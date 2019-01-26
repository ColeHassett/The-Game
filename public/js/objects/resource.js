class Resource {

	//const MAX_HP = 5;

	contructor(id) {
		this.id = id;
		this.occupied = false;
		this.health = MAX_HP;
		this.alive = true;
	}

	get id() {
		return this.id;
	}

	get occupied() {
		return this.occupied;
	}

	set occupied(value) {
		this.occupied = value;
	}

	get health() {
		return this.health;
	}

	get alive() {
		return this.alive;
	}

	harvest(chance) {
		this.occupied = true;
		var success_check = Math.round(Math.random() + (chance/100));
		if (success_check) {
			if (this.health > 1) {
				this.health -= 1;
			} else {
				this.alive = false;
				this.occupied = false;
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
