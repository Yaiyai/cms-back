const express = require('express');
const dbConnection = require('./database/config');

require('dotenv').config();
const cors = require('cors');

//Servidor
const app = express();

//Conexión a la base de datos
dbConnection();

//CORS
app.use(cors());

//Lectura y parseo del body
app.use(express.json());

//Rutas
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/companies', require('./routes/company.routes'));
app.use('/api/sections', require('./routes/section.routes'));
app.use('/api/posts', require('./routes/post.routes'));
app.use('/api/texts', require('./routes/text.routes'));
app.use('/api/images', require('./routes/image.routes'));
app.use('/api/messages', require('./routes/messages.routes'));
app.use('/api/maquinaria', require('./routes/maquinas.routes'));

//Escuchar peticiones
app.listen(process.env.PORT, () => console.log(`Servidor establecido en puerto ${process.env.PORT}`));

module.exports = app;
