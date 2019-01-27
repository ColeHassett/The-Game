var Resource = require(__dirname + '/resource.js');

class Rock extends Resource {

	constructor(position) {
		super(position);
		this.drop_id = '2';
		Rock.list.push(this);
	}

};

Rock.list = [];

module.exports = Rock;
