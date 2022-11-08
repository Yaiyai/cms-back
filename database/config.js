const mongoose = require('mongoose')

const dbConnection = () => {
	mongoose.set('useFindAndModify', false)
	mongoose
		.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
		.then((x) => console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`))
		.catch((err) => console.error('Error connecting to mongo', err))
}

module.exports = dbConnection
