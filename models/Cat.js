const mongoose = require('mongoose')

// Below is the schema for cats. 
// To make your own Schema, check the documentation Here:
// https://mongoosejs.com/docs/guide.html#definition
// You can also try a Schema Generator like this one:
// https://replit.com/@haroldsikkema/Schema-Generator-for-Mongoose
 const CatSchema = new mongoose.Schema({
  name: { type: 'String' },
  species: { type: 'String' },
  color: { type: 'String' },
  description: { type: 'String' },
  fileName: { type: 'String' },
  playfulness: { type: 'Number' },
  appetite: { type: 'Number' },
  birthDate: { type: 'Date' },
  adopted: { type: 'Boolean' },
  human: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
   
})
 

// Check if this cat is owned by a given user 
CatSchema.methods.isOwnedBy = function(username) {
  return (this?.human?.username == username) ? true : false
}

module.exports = mongoose.model('Cat', CatSchema );