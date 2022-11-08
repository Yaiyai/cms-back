const express = require('express')
const { getText, deleteText, updateText, addText } = require('./controllers/text.controller')
const tokenValidator = require('../middlewares/tokenValidator')

const router = express.Router()

// /api/texts

router.get('/:postID', getText)

router.use(tokenValidator)
router.post('/:postID', addText)
router.put('/:textID', updateText)
router.delete('/:textID', deleteText)

module.exports = router
