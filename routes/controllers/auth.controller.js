const User = require('../../models/user.model')
const bcrypt = require('bcryptjs')
const generateJWT = require('../../helpers/jwt')

const addUser = async (req, res) => {
	const { name, email, password } = req.body
	const salt = bcrypt.genSaltSync(10)
	const pwd = bcrypt.hashSync(password, salt)
	const token = await generateJWT(name, email)

	let alreadyUser = await User.findOne({ email: email })
	if (alreadyUser) {
		return res.status(400).json({ ok: false, msg: 'Este email ya existe en la base de datos.' })
	}

	await User.create({ name, email, password: pwd })
		.then((user) => res.status(201).json({ ok: true, msg: 'Usuario creado', name: user.name, email: user.email, id: user.id, token }))
		.catch((err) => res.status(500).json({ ok: false, error: err }))
}

const loginUser = async (req, res) => {
	const { email, password } = req.body
	let loggedUser = await User.findOne({ email: email })

	if (!loggedUser) {
		return res.status(400).json({ ok: false, msg: 'Este usuario no existe' })
	}
	//Confirmar las contraseñas
	const validPwd = await bcrypt.compareSync(password, loggedUser.password)

	if (!validPwd) {
		return res.status(400).json({ ok: false, msg: 'La constraseña es incorrecta.' })
	}
	const token = await generateJWT(loggedUser.name, loggedUser.email)

	//Si llegamos aqui, generamos un JSON Web token(manejo el estado de sesion del user de forma pasiva)
	res.status(201).json({ ok: true, msg: 'Usuario logeado', name: loggedUser.name, email: loggedUser.email, id: loggedUser.id, token })
}

const renewToken = async (req, res) => {
	const { id, name } = req.body
	const newToken = await generateJWT(id, name)

	res.status(201).json({ ok: true, msg: 'revalidar token', id, name, token: newToken })
}

module.exports = {
	addUser,
	loginUser,
	renewToken,
}
