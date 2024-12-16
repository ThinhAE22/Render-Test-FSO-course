const express = require('express')
const morgan = require('morgan');
const cors = require('cors');
const app = express()

app.use(express.static('dist'))
app.use(express.json())
app.use(cors())

let persons = [
    { 
      id: "1",
      name: "Arto Hellas", 
      number: "040-123456"
    },
    { 
      id: "2",
      name: "Ada Lovelace", 
      number: "39-44-5323523"
    },
    { 
      id: "3",
      name: "Dan Abramov", 
      number: "12-43-234345"
    },
    { 
      id: "4",
      name: "Mary Poppendieck", 
      number: "39-23-6423122"
    }
]

morgan.token('host', function(req, res) {
  return req.hostname;
});

morgan.token('data', function(req, res) {
  return JSON.stringify(req.body);  // logs the request body
});

app.use(morgan(':method :url :status :host :response-time ms :data'));

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

//info
app.get('/info', (request, response) => {
    const PersonNumber = persons.length
    console.log(Number(PersonNumber))
    const time = new Date()
    console.log(time.toString())
    response.send(
        `<p>Phonebook has info for ${PersonNumber} people</p>
        <p><strong>${time.toString()}</strong></p>
        ` 
    )
})

//get all
app.get('/api/persons', (request, response) => {
  response.json(persons)
  //response.end(JSON.stringify(notes)) 
})

// get 1 person
app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const person = persons.find(p=> p.id === id)
  
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})


//Delete 1 person
app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(p => p.id !== id)
  
    response.status(204).end()
})

const generateId = () => {
    const maxId = persons.length > 0
      ? Math.max(...persons.map(p => Number(p.id)))
      : 0
    return String(maxId + 1)
  }
  
app.post('/api/persons', (request, response) => {
    const body = request.body;
    const namelist = persons.map(p => p.name);

    if (!body.name || !body.number) {
    return response.status(400).json({ 
        error: 'name and number missing' 
    });
    } else if (namelist.find(n => n === body.name)) {  
    return response.status(400).json({ 
        error: 'name must be unique' 
    });
    }

  
    const person = {
      id: generateId(),
      name: body.name,
      number: body.number,
    }
  
    persons = persons.concat(person)
    console.log(person)
    response.json(person)
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})