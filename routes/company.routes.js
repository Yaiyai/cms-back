const express = require('express')
const tokenValidator = require('../middlewares/tokenValidator')
const { check } = require('express-validator')
const formValidator = require('../middlewares/formValidator')
const { getCompany, addCompany, updateCompany, deleteCompany } = require('./controllers/company.controller')
const router = express.Router()

///api/companies

router.get('/', getCompany)

//Solo usuarios logeados pueden añadir, borrar o editar la info de la empresa
router.use(tokenValidator) //Poniendolo aqui, todas las rutas que estén por debajo, solo podrán accederse si se está validado

router.post(
	'/',
	[
		check('name', 'el name de la empresa es obligatorio').not().isEmpty(),
		check('phone', 'el phone de la empresa es obligatorio').not().isEmpty(),
		check('address', 'el address de la empresa es obligatorio').not().isEmpty(),
		check('mainLogo', 'el mainLogo de la empresa es obligatorio').not().isEmpty(),
		formValidator,
	],
	addCompany
)
router.put('/:companyID', updateCompany)
router.delete('/:companyID', deleteCompany)

module.exports = router
