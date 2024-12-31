const express = require('express')
const morgan = require('morgan');
const cors = require('cors');
const app = express()

require('dotenv').config()

const Contact = require('./models/contact')

app.use(express.static('dist'))
app.use(express.json())
app.use(cors())

/*
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
*/
//Define unknow endpoint
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}


morgan.token('host', function(req, res) {
  return req.hostname;
});

morgan.token('data', function(req, res) {
  return JSON.stringify(req.body);  // logs the request body
});


const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(morgan(':method :url :status :host :response-time ms :data'));

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

//info
app.get('/info', (request, response) => {
  Contact.countDocuments({})
    .then(count => {
      const time = new Date();
      response.send(
        `<p>Phonebook has info for ${count} people</p>
        <p><strong>${time.toString()}</strong></p>`
      );
    })
    .catch(error => {
      console.error(error);
      response.status(500).json({ error: 'Unable to fetch info' });
    });
});


//get all
app.get('/api/persons', (request, response) => {
  Contact.find({}).then(contacts => {
    response.json(contacts)
  })
  //response.json(persons)
  //response.end(JSON.stringify(notes)) 
})

app.post('/api/persons', (request, response, next) => {
  const { name, number } = request.body;

  // Check if name or number is missing
  if (!name || !number) {
    return response.status(400).json({
      error: 'Name or number is missing',
    });
  }

  // Find if the contact with the same name already exists
  Contact.findOne({ name: name })
    .then(existingContact => {
      if (!existingContact) {
        // If contact does not exist, create and save a new contact
        const contact = new Contact({
          name: name,
          number: number,
        });

        contact.save()
          .then(savedContact => {
            response.json(savedContact);  // Respond with the saved contact
          })
          .catch(error => next(error));  // Handle any errors during save
      } else {
        // If contact already exists, update the contact
        existingContact.number = number;  // Update the number for the existing contact

        existingContact.save()
          .then(updatedContact => {
            response.json(updatedContact);  // Respond with the updated contact
          })
          .catch(error => next(error));  // Handle any errors during save
      }
    })
    .catch(error => next(error));  // Handle errors from findOne
  
  /*else if (namelist.find(n => n === body.name)) {  
  return response.status(400).json({ 
      error: 'name must be unique' 
  });
  }*/

  /*
  const person = {
    id: generateId(),
    name: body.name,
    number: body.number,
  }

  persons = persons.concat(person)
  console.log(person)
  response.json(person)
  */

  
})


// get 1 person
app.get('/api/persons/:id', (request, response) => {
  /*
  const id = request.params.id
  const person = persons.find(p=> p.id === id)
  
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
  */
  Contact.findById(request.params.id)
      .then(note => {
        if (note) {
          response.json(note)
        } else {
          response.status(404).end() 
        }
      })
      .catch(error => next(error))
})


//Delete 1 person
app.delete('/api/persons/:id', (request, response) => {
  Contact.findByIdAndDelete(request.params.id)
      .then(result => {
        response.status(204).end()
      })
      .catch(error => next(error))
});


/*
const generateId = () => {
    const maxId = persons.length > 0
      ? Math.max(...persons.map(p => Number(p.id)))
      : 0
    return String(maxId + 1)
  }
*/

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body;

  // Ensure both name and number are provided
  if (!name || !number) {
    return response.status(400).json({
      error: 'Name or number is missing',
    });
  }

  Contact.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedContact => {
      if (!updatedContact) {
        return response.status(404).json({
          error: 'Contact not found',
        });
      }
      response.json(updatedContact);
    })
    .catch(error => next(error));  // Handle other errors
});


app.use(unknownEndpoint)
// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})