const Image = require('../../models/subdocs/image.model')

const getImage = async (req, res) => {
	const postID = req.params.postID
	await Image.find({ post: postID })
		.populate('post')
		.then((images) => res.status(201).json({ ok: true, msg: 'Imagen encontrado', images }))
		.catch((err) => res.status(400).json({ ok: false, msg: 'No se ha encontrado la imagen que buscas', err }))
}

const addImage = async (req, res) => {
	const postID = req.params.postID

	await Image.create({ image: req.body.image, order: req.body.order, post: postID })
		.then((image) => res.status(201).json({ ok: true, msg: 'Imagen creado', image }))
		.catch((err) => res.status(400).json({ ok: false, msg: 'No se ha creala imagen', err }))
}

const updateImage = async (req, res) => {
	const imageID = req.params.imageID
	const checkExistence = await Image.findById(imageID)
	if (!checkExistence) {
		return res.status(400).json({ ok: false, msg: 'No se ha encontrado la imagen que quieres actualizar' })
	}
	const imageUpdated = req.body

	await Image.findByIdAndUpdate(imageID, imageUpdated, { new: true })
		.then((image) => res.status(201).json({ ok: true, msg: 'Imagen encontrado', image }))
		.catch((err) => res.status(400).json({ ok: false, msg: 'No se ha encontrado la imagen que buscas', err }))
}

const deleteImage = async (req, res) => {
	const imageID = req.params.imageID
	const checkExistence = await Image.findById(imageID)
	if (!checkExistence) {
		return res.status(400).json({ ok: false, msg: 'No se ha encontrado la imagen que quieres borrar' })
	}

	await Image.findByIdAndRemove(imageID)
		.then(() => res.status(201).json({ ok: true, msg: 'Imagen borrado' }))
		.catch((err) => res.status(400).json({ ok: false, msg: 'No se ha borrado la imagen que querías', err }))
}

module.exports = { getImage, addImage, updateImage, deleteImage }
