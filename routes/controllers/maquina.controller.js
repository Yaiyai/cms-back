const Maquina = require('../../models/maquina.model');
const convertSlug = require('../../helpers/createSlug');
const mongoose = require('mongoose');

const addMaquina = async (req, res) => {
	const newMaquina = {
		...req.body,
		lang: req.body.lang || 'es',
		contentId: req.body.contentId || new mongoose.Types.ObjectId().toString(),
	};

	try {
		// Crear la máquina principal
		const maquina = await Maquina.create(newMaquina);

		// Si se creó en español y NO se proporcionó contentId (es contenido nuevo), crear versión EN automáticamente
		if (maquina.lang === 'es' && !req.body.contentId) {
			const enMaquina = {
				...newMaquina,
				lang: 'en',
				contentId: maquina.contentId,
			};

			// Añadir sufijo EN al nombre para evitar duplicados
			if (enMaquina.name) {
				enMaquina.name = enMaquina.name + ' EN';
			}

			// Ajustar slug si existe para evitar duplicados
			if (enMaquina.slug) {
				enMaquina.slug = enMaquina.slug + '-en';
				enMaquina.slugArray = [enMaquina.slug];
			}

			await Maquina.create(enMaquina);
		}

		res.status(201).json({ ok: true, msg: 'Maquina creada', data: maquina });
	} catch (err) {
		res.status(400).json({ ok: false, msg: 'Maquina no creada', err });
	}
};

const updateMaquina = async (req, res) => {
	const maquinaID = req.params.maquinaId;
	const lang = req.query.lang;

	const filter = lang ? { _id: maquinaID, lang } : { _id: maquinaID };
	const checkExistence = await Maquina.findOne(filter);

	if (!checkExistence) {
		return res.status(404).json({ ok: false, msg: 'Maquina no encontrada para el idioma especificado.' });
	}

	const update = req.body;
	await Maquina.findOneAndUpdate(filter, update, { new: true })
		.then((data) => res.status(200).json({ ok: true, msg: 'Maquina actualizada', data }))
		.catch((err) => res.status(400).json({ ok: false, msg: 'Maquina no actualizada', err }));
};

const deleteMaquina = async (req, res) => {
	const maquinaID = req.params.maquinaId;

	try {
		// Encontrar la máquina para obtener su contentId
		const maquina = await Maquina.findById(maquinaID);

		if (!maquina) {
			return res.status(404).json({ ok: false, msg: 'Maquina no encontrada, no se puede borrar.' });
		}

		const contentId = maquina.contentId;

		// Borrar todas las versiones (todos los idiomas) con ese contentId
		const deleteResult = await Maquina.deleteMany({ contentId });

		res.status(200).json({
			ok: true,
			msg: 'Maquina y todas sus traducciones borradas',
			deletedCount: deleteResult.deletedCount,
		});
	} catch (err) {
		res.status(400).json({ ok: false, msg: 'Maquina no borrada', err });
	}
};

const getAllMaquinas = async (req, res) => {
	const lang = req.query.lang || 'es';

	await Maquina.find({ lang })
		.then((data) => res.status(200).json({ ok: true, msg: 'Maquinas traidas', data }))
		.catch((err) => res.status(400).json({ ok: false, msg: 'Maquina no encontradas', err }));
};

const getMaquina = async (req, res) => {
	const id = req.params.maquinaId;
	const lang = req.query.lang || 'es';

	try {
		// 1. Buscar por ID en el idioma solicitado
		let maquina = await Maquina.findOne({ _id: id, lang });

		if (maquina) {
			return res.status(200).json({ ok: true, msg: 'Maquina encontrada', data: maquina });
		}

		// 2. Si no encuentra, buscar solo por ID (puede estar en otro idioma)
		const anyLangMaquina = await Maquina.findById(id);

		if (!anyLangMaquina) {
			return res.status(404).json({ ok: false, msg: 'Maquina no encontrada' });
		}

		// 3. Buscar la traducción usando contentId
		const translatedMaquina = await Maquina.findOne({
			contentId: anyLangMaquina.contentId,
			lang,
		});

		if (translatedMaquina) {
			return res.status(200).json({
				ok: true,
				msg: 'Maquina encontrada (traducción)',
				langMismatch: true,
				requestedLang: lang,
				data: translatedMaquina,
			});
		}

		// 4. No hay traducción, devolver versión original con aviso
		return res.status(200).json({
			ok: true,
			msg: 'Maquina encontrada pero sin traducción al idioma solicitado',
			translationMissing: true,
			requestedLang: lang,
			availableLang: anyLangMaquina.lang,
			data: anyLangMaquina,
		});
	} catch (err) {
		return res.status(400).json({ ok: false, msg: 'Maquina no encontrada', err });
	}
};

const sluggingIt = async (maquina) => {
	if (!maquina.slug) {
		let newSlug = convertSlug(maquina.name);
		await Maquina.findByIdAndUpdate(maquina._id, { slug: newSlug, slugArray: [newSlug] }, { new: true }).catch((err) =>
			res.status(400).json({ ok: false, msg: 'No se ha actualizado el slug del post', err }),
		);
	}
	return;
};

const getMaquinaBySlug = async (req, res) => {
	const maquinaSlug = req.params.maquinaSlug;
	const lang = req.query.lang || 'es';

	try {
		// 1. Buscar por slug en el idioma solicitado
		let maquina = await Maquina.findOne({ slug: maquinaSlug, lang });

		if (maquina) {
			return res.status(200).json({
				ok: true,
				msg: 'Máquina encontrada con ese slug',
				redirect: false,
				data: maquina,
			});
		}

		// 2. Buscar en slugArray por si fue un slug antiguo
		maquina = await Maquina.findOne({ slugArray: maquinaSlug, lang });

		if (maquina) {
			return res.status(200).json({
				ok: true,
				msg: 'Máquina encontrada con ese slug (antiguo)',
				redirect: true,
				data: maquina,
			});
		}

		// 3. Buscar el slug en cualquier idioma para obtener contentId
		const anyLangMaquina = await Maquina.findOne({
			$or: [{ slug: maquinaSlug }, { slugArray: maquinaSlug }],
		});

		if (!anyLangMaquina) {
			return res.status(404).json({
				ok: false,
				msg: 'Máquina no encontrada con ese slug en ningún idioma',
			});
		}

		// 4. Buscar la versión traducida usando contentId
		const translatedMaquina = await Maquina.findOne({
			contentId: anyLangMaquina.contentId,
			lang,
		});

		if (translatedMaquina) {
			return res.status(200).json({
				ok: true,
				msg: 'Máquina encontrada (traducción desde otro slug)',
				redirect: true,
				slugMismatch: true,
				originalSlug: maquinaSlug,
				correctSlug: translatedMaquina.slug,
				data: translatedMaquina,
			});
		}

		// 5. No hay traducción, devolver versión original con aviso
		return res.status(200).json({
			ok: true,
			msg: 'Máquina encontrada pero sin traducción al idioma solicitado',
			translationMissing: true,
			requestedLang: lang,
			availableLang: anyLangMaquina.lang,
			data: anyLangMaquina,
		});
	} catch (err) {
		return res.status(400).json({
			ok: false,
			msg: 'Error al buscar máquina',
			error: err,
		});
	}
};

const createSlugs = async (req, res) => {
	await Maquina.find()
		.then((maquinas) => maquinas.forEach((maquina) => sluggingIt(maquina)))
		.then(() => res.status(201).json({ ok: true, msg: 'Slugs Creados en máquinas sin slugs' }))
		.catch((err) => res.status(400).json({ ok: false, msg: 'No se han podido crear slugs en máquinas', err }));
};

module.exports = { addMaquina, updateMaquina, deleteMaquina, getAllMaquinas, getMaquina, createSlugs, getMaquinaBySlug };
