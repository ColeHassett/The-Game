class Map {

	constructor(map) {
        this.json = map;
		this.objects = {
            ores: [],
            trees: []
        };
	}

    init() {
        let map = this.json;

        let layers = map.layers;
        let ores = layers.filter(layer => layer.name === "Ore");
        let trees = layers.filter(layer => layer.name === "Trees");

        if (trees.length !== 1) {
        	throw new Error("More than one set of tree objects found");
        } else if (ores.length !== 1) {
        	throw new Error("More than one set of ore objects found");
        } else {
        	this.objects.trees = trees[0].objects;
        	this.objects.ores = ores[0].objects;
        }
    }

};

module.exports = Map;
