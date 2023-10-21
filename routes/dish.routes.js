const express = require('express');
const { getDish, addDish, updateDish, deleteDish, getCategoryDishes, getDishes, createLanguages, getDishesByLang, translateDish } = require('./controllers/dish.controller');
const tokenValidator = require('../middlewares/tokenValidator');

const router = express.Router();

// /api/dish
router.get('/', getDishes);
router.get('/language', getDishesByLang);
router.get('/category/:category', getCategoryDishes);
router.get('/:dishId', getDish);
router.use(tokenValidator);
router.post('/translate/:dishId', translateDish);
router.post('/createlangs', createLanguages);
router.post('/', addDish);
router.put('/:dishId', updateDish);
router.delete('/:dishId', deleteDish);

module.exports = router;
