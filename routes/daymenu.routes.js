const express = require('express');
const { getDaymenu, addDaymenu, updateDaymenu, deleteDaymenu, getAllDaymenu } = require('./controllers/daymenu.controller');
const tokenValidator = require('../middlewares/tokenValidator');

const router = express.Router();

// /api/daymenu
router.get('/', getAllDaymenu);
router.get('/:daymenuId', getDaymenu);
router.use(tokenValidator);
router.post('/', addDaymenu);
router.put('/:daymenuId', updateDaymenu);
router.delete('/:daymenuId', deleteDaymenu);

module.exports = router;
