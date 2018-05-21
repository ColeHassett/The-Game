var AccountController = function (userModel, session) {

	this.crypto = require('crypto');
	this.uuid = require('node-uuid');
	this.ApiResponse = require('../models/api-response.js');
	this.ApiMessages = require('../models/api-messages.js');
	this.UserProfileModel = require('../models/user-profile.js');
	this.userModel = userModel;
	this.session = session;
}

AccountController.prototype.getSession = function () {
	return this.session;
}

AccountController.prototype.setSession = function () {
	this.session = session;
}

AccountController.prototype.hashPassword = function (password, salt, callback) {
	var iterations = 10000,
		key_len = 64;

	this.crypto.pbkdf2(password, salt, iterations, key_len, callback);
}

AccountController.prototype.logon = function (username, password, callback) {
	var me = this;

	me.userModel.findOne({username: username}, function (err, user) {
		if (err) {
			return callback(err, new me.ApiResponse({
				success: false,
				extras: {
					msg: me.ApiMessages.DB_ERROR
				}
			}));
		}

		if (user) {
			me.hashPassword(password, user.passwordSalt, function (err, passwordHash) {
				if (passwordHash == user.passwordHash) {
					var userProfileModel = new me.UserProfileModel({
						username: user.username
					});

					me.session.UserProfileModel = userProfileModel;

					return callback(err, new me.ApiResponse({
						success : true,
						extras: {
							userProfileModel: userProfileModel
						}
					}));
				} else {
					return callback(err, new me.ApiResponse({
						success: false,
						extras: {
							msg: me.ApiMessages.INVALID_PASSWORD
						}
					}));
				}
			});
		} else {
			return callback(err, new me.ApiResponse({
				success: false,
				extras: {
					msg: me.ApiMessages.USER_NOT_FOUND
				}
			}));
		}
	})
};

AccountController.prototype.logoff = function () {
	if (this.sessions.userProfileModel) {
		delete this.session.userProfileModel;
	}
	return;
};

AccountController.prototype.register = function (new_user, callback) {
	var me = this;
	me.userModel.findOne( {
		username: new_user.username
	}, function (err, user) {

		if (err) {
			return callback(err, new me.ApiResponse({
				success: false,
				extras: {
					msg: me.ApiMessages.DB_ERROR
				}
			}));
		}

		if (user) {
			return callback(err, new me.ApiResponse({
				success: false,
				extras: {
					msg: me.ApiMessages.USER_ALREADY_EXISTS
				}
			}));
		} else {
			new_user.save(function (err, user, number_affected) {

				if (err) {
					return callback(err, new me.ApiResponse({
						success: false,
						extras: {
							msg: me.ApiMessages.DB_ERROR
						}
					}));
				}

				if (number_affected === 1) {
					var userProfileModel = new me.UserProfileModel({
						username: user.username
					});

					return callback(err, new me.ApiResponse({
						success: true,
						extras: {
							userProfileModel: userProfileModel
						}
					}));
				} else {
					return callback(err, new me.ApiResponse({
						success: false,
						extras: {
							msg: me.ApiMessages.COULD_NOT_CREATE_USER
						}
					}));
				}
			});
		}
	});
};

module.exports = AccountController;
