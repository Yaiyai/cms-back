const Daymenu = require('./../../models/daymenu.model');

const getAllDaymenu = async (req, res) => {
	await Daymenu.find()
		.then((daymenus) => res.status(201).json({ ok: true, msg: 'Daymenus encontrados', daymenus }))
		.catch((err) => res.status(400).json({ ok: false, msg: 'Daymenus no encontrados', err }));
};
const getDaymenu = async (req, res) => {
	const daymenuId = req.params.daymenuId;
	await Daymenu.findById(daymenuId)
		.then((daymenu) => res.status(201).json({ ok: true, msg: 'Daymenu encontrado', daymenu }))
		.catch((err) => res.status(400).json({ ok: false, msg: 'Daymenu no encontrado', err }));
};

const addDaymenu = async (req, res) => {
	const createdDaymenu = req.body;
	await Daymenu.create(createdDaymenu)
		.then((daymenu) => res.status(201).json({ ok: true, msg: 'Daymenu creado', daymenu }))
		.catch((err) => res.status(400).json({ ok: false, msg: 'Daymenu no actualizado', err }));
};

const updateDaymenu = async (req, res) => {
	const daymenuId = req.params.daymenuId;
	const checkExistence = await Daymenu.findById(daymenuId);
	if (!checkExistence) {
		return res.status(404).json({ ok: false, msg: 'Daymenu no encontrado, no se puede actualizar.' });
	}
	const updatedDaymenu = req.body;
	await Daymenu.findByIdAndUpdate(daymenuId, updatedDaymenu, { new: true })
		.then((daymenu) => res.status(201).json({ ok: true, msg: 'Daymenu actualizado', daymenu }))
		.catch((err) => res.status(400).json({ ok: false, msg: 'Daymenu no actualizado', err }));
};

const deleteDaymenu = async (req, res) => {
	const daymenuId = req.params.daymenuId;
	const checkExistence = await Daymenu.findById(daymenuId);
	if (!checkExistence) {
		return res.status(404).json({ ok: false, msg: 'Daymenu no encontrado, no se puede borrar.' });
	}
	await Daymenu.findByIdAndDelete(daymenuId)
		.then(() => res.status(201).json({ ok: true, msg: 'Daymenu borrado' }))
		.catch((err) => res.status(400).json({ ok: false, msg: 'Daymenu no borrado', err }));
};

module.exports = { getDaymenu, addDaymenu, updateDaymenu, deleteDaymenu, getAllDaymenu };
