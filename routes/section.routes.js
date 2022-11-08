const express = require('express')
const { check } = require('express-validator')
const formValidator = require('../middlewares/formValidator')
const tokenValidator = require('../middlewares/tokenValidator')
const { getSection, addSection, updateSection, deleteSection, getAllSections } = require('./controllers/section.controller')
const router = express.Router()

///api/sections

router.get('/', getAllSections)
router.get('/:sectionID', getSection)
//Solo usuarios logeados pueden añadir, borrar o editar
router.use(tokenValidator) //Poniendolo aqui, todas las rutas que estén por debajo, solo podrán accederse si se está validado
router.post('/', [check('sectionName', 'el sectionName es obligatorio').not().isEmpty(), formValidator], addSection)
router.put('/:sectionID', updateSection)
router.delete('/:sectionID', deleteSection)

module.exports = router
