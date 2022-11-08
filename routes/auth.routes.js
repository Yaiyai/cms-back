const express = require('express')
const router = express.Router()
const { check } = require('express-validator')
//middleware para validar los formularios
const formValidator = require('../middlewares/formValidator')
const tokenValidator = require('../middlewares/tokenValidator')
//Controladores
const { addUser, loginUser, renewToken } = require('./controllers/auth.controller')
//host + /api/auth

router.post('/login', [check('email', 'el email es incorrecto').isEmail(), check('password', 'la contraseña debe de ser de 4 caracteres').isLength({ min: 4 }), formValidator], loginUser)

router.post(
	'/signup',
	[
		check('name', 'el nombre es obligatorio').not().isEmpty(),
		check('email', 'el email es incorrecto').isEmail(),
		check('password', 'la contraseña debe de ser de 4 caracteres').isLength({ min: 4 }),
		formValidator,
	],
	addUser
)

router.get('/renew', renewToken)

module.exports = router
