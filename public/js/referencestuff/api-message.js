var ApiMessages = function () {}

ApiMessages.prototype.USER_NOT_FOUND = 0;
ApiMessages.prototype.INVALID_PASSWORD = 1;
ApiMessages.prototype.DATABASE_ERROR = 2;
ApiMessages.prototype.NOT_FOUND = 3;
ApiMessages.prototype.USER_ALREADY_EXISTS = 4;
ApiMessages.prototype.COULD_NOT_CREATE_USER = 5;

module.exports = ApiMessages;
