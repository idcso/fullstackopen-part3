require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const morgan = require('morgan')
const Person = require('./models/person')
const PORT = process.env.PORT || 3001

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
	console.log(error.message)

	if (error.name === 'CastError') {
		return response.status(400).send({ error: 'malformatted id' })
	} else if (error.name === 'ValidationError') {
		return response.status(400).send({ error: error.message })
	}

	next(error)
}

morgan.token('body', req => (
	Object.keys(req.body).length ? JSON.stringify(req.body) : ' '
))

app.use(express.static('dist'))
app.use(cors())
app.use(express.json())
app.use(
	morgan(':method :url :status :res[content-length] - :response-time ms :body')
)

app.get('/', (request, response) => {
	response.send('<h1>Hey<h1/>')
})

app.get('/info', (request, response) => {
	Person.find({})
		.then(result => {
			return response.send(
				`<p>
					Phonebook has info for ${result.length} people <br/>
					${new Date()}
				</p>`
			)
		})
})

app.get('/api/persons', (request, response) => {
	Person.find({}).then(result => {
		response.json(result)
	})
})

app.get('/api/persons/:id', (request, response, next) => {
	Person.findById(request.params.id)
		.then(result => {
			if (result) {
				response.json(result)
			} else {
				response.status(404).end()
			}
		})
		.catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
	const body = request.body

	if (!body.name || !body.number) {
		return response.status(400).send({ error: 'name or number is missing' })
	}

	Person.find({ name: body.name }).then(result => {
		if(result.length) {
			return response.status(400).send({ error: 'name must be unique' })
		}
		
		const newPerson = new Person({
			name: body.name,
			number: body.number,
		})
	
		newPerson.save().then(savedPerson => response.json(savedPerson))
			.catch(error => next(error))
	})
})

app.put('/api/persons/:id', (request, response, next) => {
	const person = {
		name: request.body.name,
		number: request.body.number
	}

	Person.findByIdAndUpdate(
		request.params.id, 
		person, 
		{ new: true, runValidators: true, context: 'query' }
	)
		.then(result => {
			if (!result) return response.status(400).send({ error: 'no such person found' })
			
			response.json(result)
		})
		.catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response) => {
	Person.findByIdAndDelete(request.params.id)
		.then(result => response.status(204).end())
})

app.use(unknownEndpoint)
app.use(errorHandler)

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})