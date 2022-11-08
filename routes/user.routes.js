const express = require('express')
const { getUser, deleteUser, updateUser } = require('./controllers/user.controller')
const tokenValidator = require('../middlewares/tokenValidator')

const router = express.Router()

// /api/users

router.use(tokenValidator)
router.get('/:userID', getUser)
router.put('/:userID', updateUser)
router.delete('/:userID', deleteUser)

module.exports = router
