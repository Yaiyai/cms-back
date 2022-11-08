const mongoose = require('mongoose')
const Schema = mongoose.Schema
const companyModel = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		phone: {
			type: String,
			required: true,
		},
		mainEmail: {
			type: String,
			required: true,
		},
		address: {
			type: String,
			required: true,
		},
		linkedin: {
			type: String,
		},
		facebook: {
			type: String,
		},
		instagram: {
			type: String,
		},
		twitter: {
			type: String,
		},
		mainLogo: {
			type: String,
			required: true,
		},
		secondaryLogo: {
			type: String,
		},
		categories: {
			type: Array,
		},
	},
	{
		timestamps: true,
	}
)
const Company = mongoose.model('Company', companyModel)
module.exports = Company
