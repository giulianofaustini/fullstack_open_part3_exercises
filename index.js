const express = require("express");
const morgan = require("morgan");
const app = express();

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

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

const howMany = () => persons.length;

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.get("/info", (request, response) => {
  response
    .send(
      `<p>Phonebook contains info for ${howMany()} people</p> <p>${new Date()}</p>`
    )
    .end();
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const personToDelete = persons.find((person) => person.id === id);
  if (!personToDelete) {
    response.status(404).end();
  } else {
    persons = persons.filter((person) => person.id !== id);
    response.status(204).end();
  }
});
const generatedId = () => {
  const maxId = persons.length > 0 ? Math.max(...persons.map((n) => n.id)) : 0;
  return maxId + 1;
};

app.post("/api/persons", (request, response) => {
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

  const person = {
    id: generatedId(),
    name: body.name,
    number: body.number,
  };
  console.log(person);
  persons.push(person);
  response.json(person);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
