const mongoose = require('mongoose')

const Book = require('./book')

const authorSchema = new mongoose.Schema({
  name:{
    type: String,
    required : true
  }
})

// authorSchema.pre('findOneAndDelete',async function(next){
//   await Book.find({ author: this._id }, (err, books) => {
//     if(err){
//       next(err)
//     }else if(books.length > 0){
//       next(new Error('This author has books still'))
//     }else{
//       next()
//     }
//   })
// })


authorSchema.pre('findOneAndDelete', async function (next) {
  const authorId = this.getQuery()._id
  const books = await Book.find({ author: authorId })
  if (books.length > 0) {
    next(new Error('This author has books still'))
  } else {
    next()
  }
})


module.exports = mongoose.model('Author', authorSchema)