const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const maquinaModel = new Schema(
	{
		contentId: {
			type: String,
			required: true,
			index: true,
		},
		name: {
			type: String,
			required: true,
		},
		lang: {
			type: String,
			enum: ['es', 'en'],
			default: 'es',
			required: true,
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
	},
);

// Índice compuesto único: solo una versión por idioma de cada contenido
maquinaModel.index({ contentId: 1, lang: 1 }, { unique: true });
// Índice para búsqueda por slug
maquinaModel.index({ slug: 1, lang: 1 });

const Maquina = mongoose.model('Maquina', maquinaModel);
module.exports = Maquina;
