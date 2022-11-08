const mongoose = require('mongoose')
const Schema = mongoose.Schema
const imageModel = new Schema(
	{
		post: { type: Schema.Types.ObjectId, ref: 'Post' },
		image: String,
		postType: {
			type: String,
			default: 'imagen',
		},
	},
	{
		timestamps: true,
	}
)
const Image = mongoose.model('Image', imageModel)
module.exports = Image
