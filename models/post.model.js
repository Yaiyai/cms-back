const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const postModel = new Schema(
	{
		title: String,
		status: {
			type: String,
			enum: ['borrador', 'publicado', 'privada', 'borrada'],
			default: 'borrador',
		},
		subtitle: String,
		author: { type: Schema.Types.ObjectId, ref: 'User' },
		content: {
			text: [{ type: Schema.Types.ObjectId, ref: 'Text' }],
			image: [{ type: Schema.Types.ObjectId, ref: 'Image' }],
		},
		isSlider: {
			type: Boolean,
			default: false,
		},
		isGallery: {
			type: Boolean,
			default: false,
		},
		slug: String,
		slugArray: [String],
		deletedAt: Date,
		postDate: String,
		categories: Array,
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
const Post = mongoose.model('Post', postModel);
module.exports = Post;
