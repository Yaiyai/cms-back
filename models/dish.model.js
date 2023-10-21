const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dishModel = Schema(
	{
		dish: String,
		description: String,
		price: Number,
		alergenos: [
			{
				type: String,
				enum: ['moluscos', 'lacteos', 'cascara', 'gluten', 'huevos', 'soja', 'crustaceos', 'sesamo', 'pescado', 'cacahuetes', 'altramuces', 'mostaza', 'apio'],
			},
		],
		category: String,
		active: {
			type: Boolean,
			default: true,
		},
		language: {
			type: String,
			enum: ['ES', 'EN'],
			default: 'ES',
		},
	},
	{
		timestamps: true,
	}
);

const Dish = mongoose.model('Dish', dishModel);

module.exports = Dish;
