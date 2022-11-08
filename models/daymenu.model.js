const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const daymenuModel = Schema(
	{
		title: String,
		start: Date,
		end: Date,
		firsts: {
			type: String,
			require: true,
		},
		seconds: {
			type: String,
			require: true,
		},
		price: Number,
		acclaration: String,
	},
	{
		timestamps: true,
	}
);

const Daymenu = mongoose.model('Daymenu', daymenuModel);

module.exports = Daymenu;
