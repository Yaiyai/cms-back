const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageModel = Schema(
	{
		name: {
			type: String,
			require: true,
		},
		subject: {
			type: String,
			require: true,
		},
		lastName: {
			type: String,
		},
		email: {
			type: String,
			require: true,
		},
		message: String,
		company: String,
		phone: String,
		file: String,
	},
	{
		timestamps: true,
	}
);

const Message = mongoose.model('Message', messageModel);

module.exports = Message;
