const Section = require('../../models/section.model')

const getSection = async (req, res) => {
	const sectionID = req.params.sectionID

	await Section.findById(sectionID)
		.then((section) => res.status(201).json({ ok: true, msg: 'Seccion encontrada', section }))
		.catch((err) => res.status(404).json({ ok: false, msg: 'Sección no encontrada o no existe', err }))
}

const getAllSections = async (req, res) => {
	await Section.find()
		.then((sections) => res.status(201).json({ ok: true, msg: 'Secciones encontradas', sections }))
		.catch((err) => res.status(404).json({ ok: false, msg: 'No hay secciones', err }))
}

const addSection = async (req, res) => {
	const newSection = req.body

	await Section.create(newSection)
		.then((section) => res.status(201).json({ ok: true, msg: 'Sección creada', section }))
		.catch((err) => res.status(400).json({ ok: false, msg: 'Sección no creada', err }))
}

const updateSection = async (req, res) => {
	const sectionID = req.params.sectionID
	const updatedSection = req.body

	await Section.findByIdAndUpdate(sectionID, updatedSection, { new: true })
		.then((section) => res.status(201).json({ ok: true, msg: 'Sección actualizada', section }))
		.catch((err) => res.status(400).json({ ok: false, msg: 'Sección no actualizada', err }))
}

const deleteSection = async (req, res) => {
	const sectionID = req.params.sectionID

	await Section.findByIdAndDelete(sectionID)
		.then(() => res.status(201).json({ ok: true, msg: 'Sección borrada' }))
		.catch((err) => res.status(400).json({ ok: false, msg: 'Sección no borrada', err }))
}

module.exports = { getSection, addSection, updateSection, deleteSection, getAllSections }
