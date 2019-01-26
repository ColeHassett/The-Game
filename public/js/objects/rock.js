var Resource = require(__dirname + '/resource.js');

class Rock extends Resource {

	constructor(id) {
		super(id);
		this.drop_id = '2';
	}

	get drop() {
		return this.drop_id;
	}

};

module.exports = Rock;
