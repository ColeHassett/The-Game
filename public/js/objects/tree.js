var Resource = require('./resource.js');

class Tree extends Resource {

	constructor(position) {
		super(position);
		this.drop_id = '1';
		Tree.list.push(this);
	}

};

Tree.list = [];

module.exports = Tree;
