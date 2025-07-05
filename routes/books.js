const express = require('express')
const router=express.Router()

const Book = require('../models/book')
const Author = require('../models/author')

const path = require('path')
const uploadPath = path.join('public',Book.coverImageBasePath)

const imageMimeTypes = ['image/jpeg','image/png','image/gif']

const multer = require ('multer')

const fs = require('fs')

const upload = multer({
  dest: uploadPath,
  fileFilter: (req, file, callback) => {
    callback(null, imageMimeTypes.includes(file.mimetype))
  }
})


// All books route
router.get('/', async(req,res)=>{
  let query = Book.find()
  if(req.query.title != null && req.query.title !=''){
    query = query.regex('title',new RegExp(req.query.title,'i'))
  } 
  if(req.query.publishedBefore != null && req.query.publishedBefore !=''){
    query = query.lte('publishDate', req.query.publishedBefore)
  }
  if(req.query.publishedAfter != null && req.query.publishedAfter !=''){
    query = query.lte('publishDate', req.query.publishedAfter)
  }
  try{
    const books = await query.exec()
    res.render('books/index',{
    books: books,
    searchOptions : req.query
  })
  }catch{
    res.redirect('/')
  }
})

// New Book Route
router.get('/new', async(req,res)=>{
    renderNewPage(res, new Book())
})

router.get('/:id', async(req,res)=>{
  try{
    const book = await Book.findById(req.params.id).populate('author').exec()
    res.render('books/show',{book:book})
    console.log(book.author)
  }catch{
    res.redirect('/')
  }
})

router.get('/:id/edit', async(req,res)=>{
  // try{
  //   let book = await Book.findById(req.params.id) 
  //   let author = await Author.findById(book.author)
  //   res.render('books/edit',{book : book,authors: author})
  // }catch{
  //   res.redirect('/books')
  // }
  try{
    const book = await Book.findById(req.params.id)
    renderEditPage(res,book)
  }catch{

  }
})

// Create Book Route
router.post('/', upload.single('cover'), async (req,res)=>{
  const fileName = req.file != null ? req.file.filename : null
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    coverImageName: fileName,
    description: req.body.description
  })
  try{
    const newBook = await book.save()
    res.redirect('books')
  }catch (err) {
    if(book.coverImageName){
    removeBookCover(book.coverImageName)
    }
    renderNewPage(res,book,true)
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

router.put('/:id', upload.single('cover'), async (req,res)=>{
  const fileName = req.file != null ? req.file.filename : null
  let book
  try{
    book = await Book.findById(req.params.id)
    book.title= req.body.title,
    book.author= req.body.author,
    book.publishDate= new Date(req.body.publishDate),
    book.pageCount= req.body.pageCount,
    book.coverImageName= fileName,
    book.description= req.body.description
    if(req.body.cover != null && req.body.cover != ''){
      saveCover(book, req,body.cover)
    }
    await book.save()
    res.redirect(`/books/${book.id}`)
  }catch (err) {
    console.log(err)
    if(book!=null){
      renderEditPage(res,book,true)
    }else{
      redirect('/')
    }
  }
})

router.delete('/:id', async (req,res)=>{
    let book
    try{
      await Book.findByIdAndDelete(req.params.id)
      res.redirect('/books')
    }catch(e){
      console.log(e)
      if(book!=null){
        res.render('books/show',{
          book:book,
          errorMessage: 'Could not remove book'
        })
      }
      else{
        res.redirect('/')
      }
    }
  })


async function renderNewPage(res, book, hasError = false) {
  renderFormPage(res, book, 'new', hasError)
}

async function renderEditPage(res, book, hasError = false) {
  renderFormPage(res, book, 'edit', hasError)
}

async function renderFormPage(res, book, form, hasError = false) {
  try{
      const authors = await Author.find({})
      const params = {
        authors: authors,
        book: book
      }
      if(hasError) {
        if(form === 'edit'){
          params.errorMessage='Error Updating Book'
        }else
        params.errorMessage = "Error creating book"
      }
      // const book = new Book()
      res.render(`books/${form}`,params)
    }catch{
      res.redirect('/books')
    }
}



function removeBookCover(fileName){
  fs.unlink(path.join(uploadPath, fileName), err => {
    if (err) console.error(err)
  })
}

module.exports = router