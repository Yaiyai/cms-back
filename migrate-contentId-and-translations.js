const mongoose = require('mongoose');
require('dotenv').config();

const Section = require('./models/section.model');
const Maquina = require('./models/maquina.model');

const migrateContentIdAndCreateTranslations = async () => {
	try {
		// Conectar a la base de datos
		await mongoose.connect(process.env.DB, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});

		console.log('Conectado a la base de datos');

		// ===== MIGRAR SECCIONES =====
		console.log('\n--- PROCESANDO SECCIONES ---');

		// Obtener todas las secciones
		const sections = await Section.find({});
		console.log(`Total de secciones encontradas: ${sections.length}`);

		let sectionsUpdated = 0;
		let sectionsCreated = 0;

		for (const section of sections) {
			// Si no tiene contentId, asignar su _id como contentId
			if (!section.contentId) {
				section.contentId = section._id.toString();
				await section.save();
				sectionsUpdated++;
				console.log(`✓ Section ${section._id} actualizada con contentId`);
			}

			// Verificar si ya existe versión en inglés
			const existsEnVersion = await Section.findOne({
				contentId: section.contentId,
				lang: 'en',
			});

			// Si no existe versión en inglés y la actual es en español, crearla
			if (!existsEnVersion && section.lang === 'es') {
				const enSection = section.toObject();
				delete enSection._id;
				enSection.lang = 'en';

				// Añadir sufijo EN al sectionName para evitar duplicados
				if (enSection.sectionName) {
					enSection.sectionName = enSection.sectionName + ' EN';
				}

				// Si tiene slug, ajustarlo para evitar duplicados
				if (enSection.slug) {
					enSection.slug = enSection.slug + '-en';
					enSection.slugArray = [enSection.slug];
				}

				await Section.create(enSection);
				sectionsCreated++;
				console.log(`✓ Versión EN creada para section ${section.contentId}`);
			}
		}

		console.log(`\nSecciones actualizadas con contentId: ${sectionsUpdated}`);
		console.log(`Versiones EN de secciones creadas: ${sectionsCreated}`);

		// ===== MIGRAR MÁQUINAS =====
		console.log('\n--- PROCESANDO MÁQUINAS ---');

		// Obtener todas las máquinas
		const maquinas = await Maquina.find({});
		console.log(`Total de máquinas encontradas: ${maquinas.length}`);

		let maquinasUpdated = 0;
		let maquinasCreated = 0;

		for (const maquina of maquinas) {
			// Si no tiene contentId, asignar su _id como contentId
			if (!maquina.contentId) {
				maquina.contentId = maquina._id.toString();
				await maquina.save();
				maquinasUpdated++;
				console.log(`✓ Maquina ${maquina._id} actualizada con contentId`);
			}

			// Verificar si ya existe versión en inglés
			const existsEnVersion = await Maquina.findOne({
				contentId: maquina.contentId,
				lang: 'en',
			});

			// Si no existe versión en inglés y la actual es en español, crearla
			if (!existsEnVersion && maquina.lang === 'es') {
				const enMaquina = maquina.toObject();
				delete enMaquina._id;
				enMaquina.lang = 'en';

				// Añadir sufijo EN al nombre para evitar duplicados
				if (enMaquina.name) {
					enMaquina.name = enMaquina.name + ' EN';
				}

				// Ajustar slug para evitar duplicados
				if (enMaquina.slug) {
					enMaquina.slug = enMaquina.slug + '-en';
					enMaquina.slugArray = [enMaquina.slug];
				}

				await Maquina.create(enMaquina);
				maquinasCreated++;
				console.log(`✓ Versión EN creada para maquina ${maquina.contentId}`);
			}
		}

		console.log(`\nMáquinas actualizadas con contentId: ${maquinasUpdated}`);
		console.log(`Versiones EN de máquinas creadas: ${maquinasCreated}`);

		console.log('\n========================================');
		console.log('MIGRACIÓN COMPLETADA EXITOSAMENTE');
		console.log('========================================');
		console.log(`Total sections con contentId: ${sectionsUpdated}`);
		console.log(`Total sections EN creadas: ${sectionsCreated}`);
		console.log(`Total maquinas con contentId: ${maquinasUpdated}`);
		console.log(`Total maquinas EN creadas: ${maquinasCreated}`);

		// Cerrar conexión
		await mongoose.connection.close();
		console.log('\nConexión cerrada');
		process.exit(0);
	} catch (error) {
		console.error('Error en la migración:', error);
		process.exit(1);
	}
};

migrateContentIdAndCreateTranslations();
