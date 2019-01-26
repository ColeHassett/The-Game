var Resource = require(__dirname + '/resource.js');

class Tree extends Resource {

	constructor(id) {
		super(id);
		this.drop_id = '1';
	}

	get drop() {
		return this.drop_id;
	}

};

module.exports = Tree;
