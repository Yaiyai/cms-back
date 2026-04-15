const Section = require('../../models/section.model');
const mongoose = require('mongoose');

const getSection = async (req, res) => {
	const sectionID = req.params.sectionID;
	const lang = req.query.lang || 'es';

	try {
		// 1. Buscar por ID en el idioma solicitado
		let section = await Section.findOne({ _id: sectionID, lang });

		if (section) {
			return res.status(200).json({ ok: true, msg: 'Seccion encontrada', section });
		}

		// 2. Si no encuentra, buscar solo por ID (puede estar en otro idioma)
		const anyLangSection = await Section.findById(sectionID);

		if (!anyLangSection) {
			return res.status(404).json({ ok: false, msg: 'Sección no encontrada' });
		}

		// 3. Buscar la traducción usando contentId
		const translatedSection = await Section.findOne({
			contentId: anyLangSection.contentId,
			lang,
		});

		if (translatedSection) {
			return res.status(200).json({
				ok: true,
				msg: 'Sección encontrada (traducción)',
				langMismatch: true,
				requestedLang: lang,
				section: translatedSection,
			});
		}

		// 4. No hay traducción, devolver versión original con aviso
		return res.status(200).json({
			ok: true,
			msg: 'Sección encontrada pero sin traducción al idioma solicitado',
			translationMissing: true,
			requestedLang: lang,
			availableLang: anyLangSection.lang,
			section: anyLangSection,
		});
	} catch (err) {
		return res.status(404).json({ ok: false, msg: 'Sección no encontrada o no existe', err });
	}
};

const getAllSections = async (req, res) => {
	const lang = req.query.lang || 'es';

	await Section.find({ lang })
		.then((sections) => res.status(200).json({ ok: true, msg: 'Secciones encontradas', sections }))
		.catch((err) => res.status(404).json({ ok: false, msg: 'No hay secciones', err }));
};

const addSection = async (req, res) => {
	const newSection = {
		...req.body,
		lang: req.body.lang || 'es',
		contentId: req.body.contentId || new mongoose.Types.ObjectId().toString(),
	};

	try {
		// Crear la sección principal
		const section = await Section.create(newSection);

		// Si se creó en español y NO se proporcionó contentId (es contenido nuevo), crear versión EN automáticamente
		if (section.lang === 'es' && !req.body.contentId) {
			const enSection = {
				...newSection,
				lang: 'en',
				contentId: section.contentId,
			};

			// Añadir sufijo EN al sectionName para evitar duplicados
			if (enSection.sectionName) {
				enSection.sectionName = enSection.sectionName + ' EN';
			}

			// Ajustar slug si existe para evitar duplicados
			if (enSection.slug) {
				enSection.slug = enSection.slug + '-en';
				enSection.slugArray = [enSection.slug];
			}

			await Section.create(enSection);
		}

		res.status(201).json({ ok: true, msg: 'Sección creada', section });
	} catch (err) {
		res.status(400).json({ ok: false, msg: 'Sección no creada', err });
	}
};

const updateSection = async (req, res) => {
	const sectionID = req.params.sectionID;
	const updatedSection = req.body;
	const lang = req.query.lang;

	// Si se proporciona lang en query, verificar que existe
	const filter = lang ? { _id: sectionID, lang } : { _id: sectionID };

	await Section.findOneAndUpdate(filter, updatedSection, { new: true })
		.then((section) => {
			if (!section) {
				return res.status(404).json({ ok: false, msg: 'Sección no encontrada para el idioma especificado' });
			}
			res.status(200).json({ ok: true, msg: 'Sección actualizada', section });
		})
		.catch((err) => res.status(400).json({ ok: false, msg: 'Sección no actualizada', err }));
};

const deleteSection = async (req, res) => {
	const sectionID = req.params.sectionID;

	try {
		// Encontrar la sección para obtener su contentId
		const section = await Section.findById(sectionID);

		if (!section) {
			return res.status(404).json({ ok: false, msg: 'Sección no encontrada' });
		}

		const contentId = section.contentId;

		// Borrar todas las versiones (todos los idiomas) con ese contentId
		const deleteResult = await Section.deleteMany({ contentId });

		res.status(200).json({
			ok: true,
			msg: 'Sección y todas sus traducciones borradas',
			deletedCount: deleteResult.deletedCount,
		});
	} catch (err) {
		res.status(400).json({ ok: false, msg: 'Sección no borrada', err });
	}
};

module.exports = { getSection, addSection, updateSection, deleteSection, getAllSections };
