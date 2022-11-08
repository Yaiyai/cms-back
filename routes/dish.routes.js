const express = require('express');
const { getDish, addDish, updateDish, deleteDish, getCategoryDishes, getDishes } = require('./controllers/dish.controller');
const tokenValidator = require('../middlewares/tokenValidator');

const router = express.Router();

// /api/dish
router.get('/', getDishes);
router.get('/category/:category', getCategoryDishes);
router.get('/:dishId', getDish);
router.use(tokenValidator);
router.post('/', addDish);
router.put('/:dishId', updateDish);
router.delete('/:dishId', deleteDish);

module.exports = router;
