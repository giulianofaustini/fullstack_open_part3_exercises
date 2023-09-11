const mongoose = require('mongoose');


if (process.argv.length !== 3) {
  console.log('Use: node script.js <password>');
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://giuliperus:${password}@cluster0.kpgjixr.mongodb.net/phonebook?retryWrites=true&w=majority`;


mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })


const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model('Person', personSchema);

if (process.argv.length === 3) {
  Person.find({}).then((res) => {
    console.log('Phonebook:');
    res.forEach((person) => {
      console.log(`${person.name}: ${person.number}`);
    });
    mongoose.connection.close();
  });
} else if (process.argv.length === 5) {
  const newPerson = new Person({
    name: process.argv[3],
    number: process.argv[4],
  });

  newPerson.save().then((result) => {
    console.log(`Added to the phonebook: ${result.name}: ${result.number}`);
    mongoose.connection.close();
  }).catch((error) => {
    console.error('Error adding person:', error);
    mongoose.connection.close();
  });
}
