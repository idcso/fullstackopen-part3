const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

mongoose.connect(url)
	.then(result => console.log('connected to MongoDB'))
	.catch(error => console.log({ error: error.message }))

const personSchema = new mongoose.Schema({
	name: {
		type: String,
		minLength: 3
	},
	number: {
		type: String,
		validate: {
			validator: function(n) {
				return /^\d{2,3}[-]\d{6,}$/.test(n)
			}
		}
	}
})

personSchema.set('toJSON', {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString()
		delete returnedObject._id
		delete returnedObject.__v
	}
})

module.exports = mongoose.model('Person', personSchema)