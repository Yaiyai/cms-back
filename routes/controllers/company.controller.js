const Company = require('../../models/company.model')

const getCompany = async (req, res) => {
	await Company.find()
		.then((company) => res.status(201).json({ ok: true, msg: 'Empresa encontrada', company }))
		.catch((err) => res.status(400).json({ ok: false, msg: 'Empresa no encontrada', err }))
}

const addCompany = async (req, res) => {
	const createdCompany = req.body
	await Company.create(createdCompany)
		.then((company) => res.status(201).json({ ok: true, msg: 'Empresa creada', company }))
		.catch((err) => res.status(400).json({ ok: false, msg: 'Empresa no actualizada', err }))
}

const updateCompany = async (req, res) => {
	const companyID = req.params.companyID
	const checkExistence = await Company.findById(companyID)
	if (!checkExistence) {
		return res.status(404).json({ ok: false, msg: 'Empresa no encontrada, no se puede actualizar.' })
	}
	const updatedCompany = req.body
	await Company.findByIdAndUpdate(companyID, updatedCompany, { new: true })
		.then((company) => res.status(201).json({ ok: true, msg: 'Empresa actualizada', company }))
		.catch((err) => res.status(400).json({ ok: false, msg: 'Empresa no actualizada', err }))
}

const deleteCompany = async (req, res) => {
	const companyID = req.params.companyID
	const checkExistence = await Company.findById(companyID)
	if (!checkExistence) {
		return res.status(404).json({ ok: false, msg: 'Empresa no encontrada, no se puede borrar.' })
	}
	await Company.findByIdAndDelete(companyID)
		.then(() => res.status(201).json({ ok: true, msg: 'Empresa borrada' }))
		.catch((err) => res.status(400).json({ ok: false, msg: 'Empresa no borrada', err }))
}

module.exports = { getCompany, addCompany, updateCompany, deleteCompany }
