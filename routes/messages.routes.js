const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
//middleware para validar los formularios
const formValidator = require('../middlewares/formValidator');
const tokenValidator = require('../middlewares/tokenValidator');
//Controladores
const { createMessage, deleteMessage, getMessages, getOne } = require('./controllers/messages.controller');

//host + /api/messages
router.post('/', createMessage);

router.use(tokenValidator);
router.get('/', getMessages);
router.get('/message/:msgId', getOne);
router.delete('/:msgId', deleteMessage);

module.exports = router;
