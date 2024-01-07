const express = require('express')
const app = express()
const cors = require('cors')
const morgan = require('morgan')
const PORT = process.env.PORT || 3001

morgan.token('body', req => (
	Object.keys(req.body).length ? JSON.stringify(req.body) : ' '
))

app.use(express.static('dist'))
app.use(cors())
app.use(express.json())
app.use(
	morgan(':method :url :status :res[content-length] - :response-time ms :body')
)

let persons = [
	{ 
		"id": 1,
		"name": "Arto Hellas", 
		"number": "040-123456"
	},
	{ 
		"id": 2,
		"name": "Ada Lovelace", 
		"number": "39-44-5323523"
	},
	{ 
		"id": 3,
		"name": "Dan Abramov", 
		"number": "12-43-234345"
	},
	{ 
		"id": 4,
		"name": "Mary Poppendieck", 
		"number": "39-23-6423122"
	}
]

app.get('/', (request, response) => {
	response.send('<h1>Hey<h1/>')
})

app.get('/info', (request, response) => {
	response.send(
		`<p>
			Phonebook has info for ${persons.length} people <br/>
			${new Date()}
		</p>`
	)
})

app.get('/api/persons', (request, response) => {
	response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
	const id = Number(request.params.id)
	const person = persons.find(person => person.id === id)

	if(person) {
		response.json(person)
	} else {
		response.status(404).end()
	}
})

app.post('/api/persons', (request, response) => {
	const randomId = Math.floor(Math.random() * (1000000 - 5) + 5)

	const newPerson = request.body

	if (!newPerson.name || !newPerson.number) {
		response.status(400).send({ error: 'name or number is missing' })
	} else if (persons.find(person => person.name === newPerson.name)) {
		response.status(400).send({ error: 'name must be unique' })
	}

	newPerson.id = randomId
	persons.concat(newPerson)

	response.json(newPerson)
})

app.delete('/api/persons/:id', (request, response) => {
	const id = Number(request.params.id)
	persons.filter(person => person.id !== id)

	response.status(204).end()
})

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})