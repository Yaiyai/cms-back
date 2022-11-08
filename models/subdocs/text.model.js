const mongoose = require('mongoose')
const Schema = mongoose.Schema
const textModel = new Schema(
	{
		post: { type: Schema.Types.ObjectId, ref: 'Post' },
		text: String,
		parsedText: Object,
		postType: {
			type: String,
			default: 'texto',
		},
	},
	{
		timestamps: true,
	}
)
const Text = mongoose.model('Text', textModel)
module.exports = Text
