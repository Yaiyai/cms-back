const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userModel = Schema(
	{
		name: {
			type: String,
			require: true,
		},
		email: {
			type: String,
			require: true,
			unique: true,
		},
		password: {
			type: String,
			require: true,
		},
		position: String,
		avatar: String,
		linkedin: String,
	},
	{
		timestamps: true,
	}
)

const User = mongoose.model('User', userModel)

module.exports = User
