var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	username: String,
	passwordHash: String,
	passwordSalt: String
});

module.exports = mongoose.model('User', UserSchema);
