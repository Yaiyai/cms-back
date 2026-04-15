const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const sectionModel = new Schema(
	{
		contentId: {
			type: String,
			required: true,
			index: true,
		},
		sectionType: {
			type: String,
			enum: ['section', 'nav', 'header', 'footer'],
			default: 'section',
		},
		sectionName: {
			type: String,
			required: true,
		},
		lang: {
			type: String,
			enum: ['es', 'en'],
			default: 'es',
			required: true,
		},
		title: String,
		subtitle: String,
		text: String,
		parsedText: Object,
		uniqueImage: String,
		gallery: Array,
		features: Array,
		formInputs: Array,
	},
	{
		timestamps: true,
	},
);

// Índice compuesto único: solo una versión por idioma de cada contenido
sectionModel.index({ contentId: 1, lang: 1 }, { unique: true });

const Section = mongoose.model('Section', sectionModel);
module.exports = Section;
