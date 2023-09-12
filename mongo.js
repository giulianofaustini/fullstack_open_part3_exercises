const mongoose = require('mongoose');

if (process.argv.length < 3) {
  console.log('Usage: node mongo.js <password> [name] [number]');
  process.exit(1);
}

const password = process.argv[2];
const name = process.argv[3];
const number = process.argv[4];

const url = `mongodb+srv://giuliperus:${password}@cluster0.kpgjixr.mongodb.net/phonebook?retryWrites=true&w=majority`;


const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model('Person', personSchema);


async function main() {
  try {
    await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

    if (process.argv.length === 3) {
      // If only 3 arguments provided, print persons in the list
      const people = await Person.find({});
      console.log('Phonebook:');
      people.forEach((person) => {
        console.log(`${person.name}: ${person.number}`);
      });
    } else if (process.argv.length === 5) {
      // If 5 arguments provided, add a new person to the list
      const newPerson = new Person({
        name: name,
        number: number,
      });

      const result = await newPerson.save();
      console.log(`Added to the phonebook: ${result.name}: ${result.number}`);
    }

    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
}

main();
