const mongoose = require('mongoose')
const Schema = mongoose.Schema
const sectionModel = new Schema(
	{
		sectionType: {
			type: String,
			enum: ['section', 'nav', 'header', 'footer'],
			default: 'section',
		},
		sectionName: {
			type: String,
			required: true,
			unique: true,
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
	}
)
const Section = mongoose.model('Section', sectionModel)
module.exports = Section
