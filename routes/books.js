const express = require('express')
const router=express.Router()

const Book = require('../models/book')
const Author = require('../models/author')

const path = require('path')
const uploadPath = path.join('public',Book.coverImageBasePath)

const imageMimeTypes = ['images/jpeg','images/png','images/gif']

const multer = require ('multer')

const upload = multer({
  dest: uploadPath,
  fileFilter: (req, file, callback) => {
    callback(null, imageMimeTypes.includes(file.mimeTye))
  }
})


// All boks route
router.get('/', async(req,res)=>{
  res.send('All books')
})

// New Book Route
router.get('/new', async(req,res)=>{
    try{
      const authors = await Author.find({})
      const book = new Book()
      res.render('books/new',{
        authors: authors,
        book: book
      })
    }catch{
      res.redirect('/books')
    }
})

// Create Book Route
router.post('/', upload.single('cover'), async (req,res)=>{
  const fileName = req.file != null ? req.file.filename : null
  const book = new Book({
    title: req.body.title,
    author: reqbody.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    coverImageName: fileName,
    description: req.body.description
  })
  try{
    const newBook = await book.save()
    res.redirect('books')
  }catch{
    
  }

//   author.save((err, newAuthor) => {
//     if(err){
//       res.render('authors/new',{
//         author: author,
//         errorMessage: 'Error Creating Author'
//       })
//     } else {
//       // res.redirect(`authors/${newAuthor.id}`)  NOT WORK IN NEW VERSION
//       res.redirect(`authors`)
//     }
//   })
//   // res.send(req.body.name)
})

module.exports = router