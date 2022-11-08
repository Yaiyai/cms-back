const Message = require('./../../models/messages.model');

const createMessage = async (req, res) => {
	const newMessage = req.body;
	await Message.create(newMessage)
		.then((message) => res.status(201).json({ ok: true, msg: 'Mensaje creado', message }))
		.catch((err) => res.status(400).json({ ok: false, msg: 'Mensajes no creado', err }));
};
const deleteMessage = async (req, res) => {
	const newMessage = req.body;
	const checkExistence = await Message.findById(req.params.msgId);
	if (!checkExistence) {
		return res.status(404).json({ ok: false, msg: 'Mensaje no encontrado, no se puede borrar.' });
	}

	await Message.findByIdAndDelete(req.params.msgId)
		.then(() => res.status(201).json({ ok: true, msg: 'Mensaje borrado' }))
		.catch((err) => res.status(400).json({ ok: false, msg: 'Mensajes no borrado', err }));
};

const getMessages = async (req, res) => {
	await Message.find()
		.then((messages) => res.status(201).json({ ok: true, msg: 'Mensajes encontrados', messages }))
		.catch((err) => res.status(404).json({ ok: false, msg: 'no hay mensajes', err }));
};

const getOne = async (req, res) => {
	await Message.findById(req.params.msgId)
		.then((message) => res.status(201).json({ ok: true, msg: 'Mensaje encontrado', message }))
		.catch((err) => res.status(404).json({ ok: false, msg: 'El mensaje que buscas no existe', err }));
};

module.exports = { createMessage, deleteMessage, getMessages, getOne };
