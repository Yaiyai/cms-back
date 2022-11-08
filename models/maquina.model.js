const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const maquinaModel = new Schema(
	{
		name: {
			type: String,
			required: true,
			unique: true,
		},
		image: {
			type: String,
			required: true,
		},
		category: {
			type: String,
			default: 'Maquinaria CNC',
			required: true,
		},
		features: {
			type: Array,
		},
		gallery: {
			type: Array,
		},
		order: {
			type: Number,
		},
		slug: String,
		slugArray: [String],
	},
	{
		timestamps: true,
	}
);
const Maquina = mongoose.model('Maquina', maquinaModel);
module.exports = Maquina;
