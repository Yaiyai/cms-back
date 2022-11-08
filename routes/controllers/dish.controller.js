const Dish = require('../../models/dish.model');

const getDishes = async (req, res) => {
	await Dish.find()
		.then((dishes) => res.status(201).json({ ok: true, msg: 'Dishes encontrado', dishes }))
		.catch((err) => res.status(400).json({ ok: false, msg: 'Dishes no encontrado', err }));
};

const getCategoryDishes = async (req, res) => {
	await Dish.find({ category: req.params.category })
		.then((dishes) => res.status(201).json({ ok: true, msg: 'Dishes de categoría encontrado', dishes }))
		.catch((err) => res.status(400).json({ ok: false, msg: 'Dishes de categoría no encontrado', err }));
};

const getDish = async (req, res) => {
	const dishId = req.params.dishId;
	await Dish.findById(dishId)
		.then((dish) => res.status(201).json({ ok: true, msg: 'Dish encontrado', dish }))
		.catch((err) => res.status(400).json({ ok: false, msg: 'Dish no encontrado', err }));
};

const addDish = async (req, res) => {
	const createdDish = req.body;
	await Dish.create(createdDish)
		.then((dish) => res.status(201).json({ ok: true, msg: 'Dish creado', dish }))
		.catch((err) => res.status(400).json({ ok: false, msg: 'Dish no actualizado', err }));
};

const updateDish = async (req, res) => {
	const dishId = req.params.dishId;
	const checkExistence = await Dish.findById(dishId);
	if (!checkExistence) {
		return res.status(404).json({ ok: false, msg: 'Dish no encontrado, no se puede actualizar.' });
	}
	const updatedDish = req.body;
	await Dish.findByIdAndUpdate(dishId, updatedDish, { new: true })
		.then((dish) => res.status(201).json({ ok: true, msg: 'Dish actualizado', dish }))
		.catch((err) => res.status(400).json({ ok: false, msg: 'Dish no actualizado', err }));
};

const deleteDish = async (req, res) => {
	const dishId = req.params.dishId;
	const checkExistence = await Dish.findById(dishId);
	if (!checkExistence) {
		return res.status(404).json({ ok: false, msg: 'Dish no encontrado, no se puede borrar.' });
	}
	await Dish.findByIdAndDelete(dishId)
		.then(() => res.status(201).json({ ok: true, msg: 'Dish borrado' }))
		.catch((err) => res.status(400).json({ ok: false, msg: 'Dish no borrado', err }));
};

module.exports = { getDish, addDish, updateDish, deleteDish, getDishes, getCategoryDishes };
