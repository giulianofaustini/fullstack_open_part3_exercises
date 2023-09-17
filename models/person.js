const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  number: {
    type: String,
    minLength: 8,
    validate: {
      validator(v) {
        return /\d{3}-\d{5, 7}/.test(v)
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
    required: [true, 'User phone number required'],
  },
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

mongoose
  .connect(url)
  .then(() => {
    console.log('Connected to MongoDB')
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error)
  })

module.exports = mongoose.model('Person', personSchema)
