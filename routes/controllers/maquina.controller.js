const Maquina = require('../../models/maquina.model');
const convertSlug = require('../../helpers/createSlug');

const addMaquina = async (req, res) => {
	const { name, image } = req.body;

	await Maquina.create(req.body)
		.then((data) => res.status(201).json({ ok: true, msg: 'Maquina creada', data }))
		.catch((err) => res.status(400).json({ ok: false, msg: 'Maquina no creada', err }));
};

const updateMaquina = async (req, res) => {
	const maquinaID = req.params.maquinaId;
	const checkExistence = await Maquina.findById(maquinaID);

	if (!checkExistence) {
		return res.status(404).json({ ok: false, msg: 'Maquina no encontrada, no se puede actualizar.' });
	}

	const update = req.body;
	await Maquina.findByIdAndUpdate(maquinaID, update, { new: true })
		.then((data) => res.status(201).json({ ok: true, msg: 'Maquina actualizada', data }))
		.catch((err) => res.status(400).json({ ok: false, msg: 'Maquina no actualizada', err }));
};

const deleteMaquina = async (req, res) => {
	const maquinaID = req.params.maquinaId;
	const checkExistence = await Maquina.findById(maquinaID);
	if (!checkExistence) {
		return res.status(404).json({ ok: false, msg: 'Maquina no encontrada, no se puede borrar.' });
	}
	await Maquina.findByIdAndDelete(maquinaID)
		.then(() => res.status(201).json({ ok: true, msg: 'Maquina borrada' }))
		.catch((err) => res.status(400).json({ ok: false, msg: 'Maquina no borrada', err }));
};

const getAllMaquinas = async (req, res) => {
	await Maquina.find()
		.then((data) => res.status(201).json({ ok: true, msg: 'Maquinas traidas', data }))
		.catch((err) => res.status(400).json({ ok: false, msg: 'Maquina no encontradas', err }));
};

const getMaquina = async (req, res) => {
	const id = req.params.maquinaId;

	await Maquina.findById(id)
		.then((data) => res.status(201).json({ ok: true, msg: 'Maquina encontrada', data }))
		.catch((err) => res.status(400).json({ ok: false, msg: 'Maquina no encontradas', err }));
};

const sluggingIt = async (maquina) => {
	if (!maquina.slug) {
		let newSlug = convertSlug(maquina.name);
		await Maquina.findByIdAndUpdate(maquina._id, { slug: newSlug, slugArray: [newSlug] }, { new: true }).catch((err) =>
			res.status(400).json({ ok: false, msg: 'No se ha actualizado el slug del post', err })
		);
	}
	return;
};

const getMaquinaBySlug = async (req, res) => {
	const maquinaSlug = req.params.maquinaSlug;
	const checkExistence = await Maquina.find({ slug: maquinaSlug });
	if (!checkExistence.length) {
		//Si no existe el string como slug principal, busco en el array de slugs a ver si existió en algun momento
		Maquina.find({ slugArray: maquinaSlug })
			.then((post) => res.status(201).json({ ok: true, msg: 'Máquina encontrada con ese slug', redirect: true, post }))
			.catch((err) => res.status(400).json({ ok: false, msg: 'Máquina no encontrada con ese slug', err }));
	} else {
		Maquina.find({ slug: maquinaSlug })
			.then((post) => res.status(201).json({ ok: true, msg: 'Máquina encontrada con ese slug', redirect: false, post }))
			.catch((err) => res.status(400).json({ ok: false, msg: 'Máquina no encontrada con ese slug', err }));
	}
};

const createSlugs = async (req, res) => {
	await Maquina.find()
		.then((maquinas) => maquinas.forEach((maquina) => sluggingIt(maquina)))
		.then(() => res.status(201).json({ ok: true, msg: 'Slugs Creados en máquinas sin slugs' }))
		.catch((err) => res.status(400).json({ ok: false, msg: 'No se han podido crear slugs en máquinas', err }));
};

module.exports = { addMaquina, updateMaquina, deleteMaquina, getAllMaquinas, getMaquina, createSlugs, getMaquinaBySlug };
