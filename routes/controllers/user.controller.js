const User = require('../../models/user.model')

const getUser = async (req, res) => {
	const userID = req.params.userID
	await User.findById(userID)
		.then((user) => res.status(201).json({ ok: true, msg: 'Usuario encontrado', user }))
		.catch((err) => res.status(400).json({ ok: false, msg: 'Usuario no encontrado', err }))
}

const updateUser = async (req, res) => {
	const userID = req.params.userID
	const checkExistence = await User.findById(userID)
	if (!checkExistence) {
		return res.status(404).json({ ok: false, msg: 'Usuario no encontrado, no se puede actualizar.' })
	}
	const updatedUser = req.body
	await User.findByIdAndUpdate(userID, updatedUser, { new: true })
		.then((user) => res.status(201).json({ ok: true, msg: 'Usuario actualizado', user }))
		.catch((err) => res.status(400).json({ ok: false, msg: 'Usuario no actualizado', err }))
}

const deleteUser = async (req, res) => {
	const userID = req.params.userID
	const checkExistence = await User.findById(userID)
	if (!checkExistence) {
		return res.status(404).json({ ok: false, msg: 'Usuario no encontrado, no se puede borrar.' })
	}
	await User.findByIdAndDelete(userID)
		.then(() => res.status(201).json({ ok: true, msg: 'Usuario borrado' }))
		.catch((err) => res.status(400).json({ ok: false, msg: 'Usuario no borrado', err }))
}

module.exports = { getUser, updateUser, deleteUser }
