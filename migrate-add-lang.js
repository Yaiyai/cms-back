const mongoose = require('mongoose');
require('dotenv').config();

const Section = require('./models/section.model');
const Maquina = require('./models/maquina.model');

const migrateData = async () => {
	try {
		// Conectar a la base de datos
		await mongoose.connect(process.env.DB, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});

		console.log('Conectado a la base de datos');

		// Migrar Sections
		const sectionsUpdated = await Section.updateMany({ lang: { $exists: false } }, { $set: { lang: 'es' } });
		console.log(`Secciones actualizadas: ${sectionsUpdated.modifiedCount}`);

		// Migrar Maquinas
		const maquinasUpdated = await Maquina.updateMany({ lang: { $exists: false } }, { $set: { lang: 'es' } });
		console.log(`Máquinas actualizadas: ${maquinasUpdated.modifiedCount}`);

		console.log('Migración completada exitosamente');

		// Cerrar conexión
		await mongoose.connection.close();
		console.log('Conexión cerrada');
		process.exit(0);
	} catch (error) {
		console.error('Error en la migración:', error);
		process.exit(1);
	}
};

migrateData();
