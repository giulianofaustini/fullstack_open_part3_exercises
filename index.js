require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
const Person = require("./models/person");

app.use(express.static("build"));
app.use(cors());
app.use(express.json());
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :requestBody"
  )
);

morgan.token("requestBody", (req, res) => {
  if (req.method === "POST") {
    return JSON.stringify(req.body);
  }
});

//  error middleware
app.use((error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).json({ error: "Malformatted ID" });
  }

  if (error.name === "NotFoundError") {
    return response.status(404).json({ error: "Person not found" });
  }

  response.status(500).json({ error: "Internal error" });
});

const howMany = () => persons.length;

app.get("/api/persons", (request, response) => {
  Person.find({})
    .then((person) => {
      response.json(person);
    })
    .catch((error) => next(error));
});

app.get("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;

  Person.findById(id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        const error = new Error("Person not found");
        error.name = "NotFoundError";
        next(error);
      }
    })
    .catch((error) => next(error)); 
});

app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;

  const updatedPerson = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(request.params.id, updatedPerson, { new: true })
    .then((updatedPerson) => {
      if (updatedPerson) {
        response.json(updatedPerson);
      } else {
        const error = new Error("Person not found");
        error.name = "NotFoundError";
        next(error);
      }
    })
    .catch((error) => next(error));
});

app.get("/info", (request, response) => {
  response
    .send(
      `<p>Phonebook contains info for ${howMany()} people</p> <p>${new Date()}</p>`
    )
    .end();
});

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

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

const generatedId = () => {
  const maxId = persons.length > 0 ? Math.max(...persons.map((n) => n.id)) : 0;
  return maxId + 1;
};

app.post("/api/persons", (request, response, next) => {
  const body = request.body;
  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "You need to provide their name and their phone number.",
    });
  }
  const nameToAdd = persons.some((person) => person.name === body.name);

  if (nameToAdd) {
    return response.status(400).json({
      error: "The name is already present in the phone number.",
    });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((savedPerson) => {
      persons.push(savedPerson);
      response.json(savedPerson);
    })
    .catch((error) => next(error));
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
