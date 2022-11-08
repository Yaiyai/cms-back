const convertSlug = (cadena) => {
	// Definimos los caracteres que queremos eliminar
	let specialChars = `!@#$^&%*()+=[]/{}|:<>?¿¡"'“”,.`
	// Los eliminamos todos
	for (let i = 0; i < specialChars.length; i++) {
		cadena = cadena.replace(new RegExp('\\' + specialChars[i], 'gi'), '')
	}
	// Lo queremos devolver limpio en minusculas
	cadena = cadena.toLowerCase()
	// Quitamos acentos y "ñ". Fijate en que va sin comillas el primer parametro
	cadena = cadena.replace(/ /gi, '-')
	cadena = cadena.replace(/á/gi, 'a')
	cadena = cadena.replace(/é/gi, 'e')
	cadena = cadena.replace(/í/gi, 'i')
	cadena = cadena.replace(/ó/gi, 'o')
	cadena = cadena.replace(/ú/gi, 'u')
	cadena = cadena.replace(/ñ/gi, 'n')
	return cadena
}

module.exports = convertSlug
