const jwt = require('jsonwebtoken')

const tokenValidator = (req, res, next) => {
	//Recibir el jwt
	const token = req.header('x-token')

	if (!token) {
		return res.status(401).json({ ok: false, msg: 'no hay token en la petición' })
	}

	try {
		const payload = jwt.verify(token, process.env.SECRET_JWT_SEED)
		req.id = payload.id
		req.name = payload.name
	} catch (e) {
		return res.status(401).json({ ok: false, msg: 'token no válido' })
	}

	next()
}

module.exports = tokenValidator
