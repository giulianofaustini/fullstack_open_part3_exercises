require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
const Person = require('./models/person')

app.use(express.static('build'))
app.use(cors())
app.use(express.json())
app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :requestBody',
  ),
)

morgan.token('requestBody', (req, _res) => {
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  }
})

const errorHandler = (error, _request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(500).send({ error: 'malformatted id' })
  }

  next(error)
}

app.use(errorHandler)

const persons = [
  {
    id: 1,
    name: 'Arto Hellas',
    number: '040-123456',
  },
  {
    id: 2,
    name: 'Ada Lovelace',
    number: '39-44-5323523',
  },
  {
    id: 3,
    name: 'Dan Abramov',
    number: '12-43-234345',
  },
  {
    id: 4,
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
  },
]

const howMany = () => persons.length

app.get('/api/persons', (_request, response) => {
  Person.find({}).then((person) => {
    response.json(person)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
        console.error(
          'Error fetching person by ID. Insert the right ID number.',
        )
      }
    })
    .catch((error) => next(error))
})

app.put('/api/persons/:id', (request, response, _next) => {
  const { body } = request

  const updatedPerson = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, updatedPerson, { new: true })
    .then((updatedPerson) => {
      if (updatedPerson) {
        response.json(updatedPerson)
      } else {
        response.status(404).json({ error: 'Person not found' })
      }
    })
    .catch((error) => {
      console.error('Error updating person:', error)
      response.status(500).json({ error: 'Malformatted ID or server error' })
    })
})

app.get('/info', (_request, response) => {
  response
    .send(
      `<p>Phonebook contains info for ${howMany()} people</p> <p>${new Date()}</p>`,
    )
    .end()
})

// app.delete("/api/persons/:id", (request, response) => {
//   const id = Number(request.params.id);
//   const personToDelete = persons.find((person) => person.id === id);
//   if (!personToDelete) {
//     response.status(404).end();
//   } else {
//     persons = persons.filter((person) => person.id !== id);
//     response.status(204).end();
//   }
// });

app.delete('/api/persons/:id', (request, response, _next) => {
  Person.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end()
    })
    .catch((error) => {
      console.error('Error deleting person by ID:', error)
      response.status(500).json({ error: 'Malformatted ID' })
    })
})

const generatedId = () => {
  const maxId = persons.length > 0 ? Math.max(...persons.map((n) => n.id)) : 0
  return maxId + 1
}

app.post('/api/persons', (request, response) => {
  const { body } = request
  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'You need to provide their name and their phone number.',
    })
  }
  const nameToAdd = persons.some((person) => person.name === body.name)

  if (nameToAdd) {
    return response.status(400).json({
      error: 'The name is already present in the phone number.',
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  // console.log(person);

  person
    .save()
    .then((savedPerson) => {
      persons.push(savedPerson)
      response.json(savedPerson)
    })
    .catch((error) => {
      console.error('Error saving person:', error)
      response.status(500).json({ error: 'Internal server error' })
    })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on 0.0.0.0:${PORT}`)
})
