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
app.use('/api/messages', require('./routes/messages.routes'));
app.use('/api/daymenu', require('./routes/daymenu.routes'));
app.use('/api/dish', require('./routes/dish.routes'));

//Escuchar peticiones
app.listen(process.env.PORT, () => console.log(`Servidor establecido en puerto ${process.env.PORT}`));

module.exports = app;
