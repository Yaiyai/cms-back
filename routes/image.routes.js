const express = require('express')
const { getImage, deleteImage, updateImage, addImage } = require('./controllers/image.controller')
const tokenValidator = require('../middlewares/tokenValidator')

const router = express.Router()

// /api/images

router.get('/:postID', getImage)

router.use(tokenValidator)
router.post('/:postID', addImage)
router.put('/:imageID', updateImage)
router.delete('/:imageID', deleteImage)

module.exports = router
