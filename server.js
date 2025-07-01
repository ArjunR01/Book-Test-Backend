// to check if the env is in production or for developement or testing
if(process.env.NODE_ENV!=='production'){
  require('dotenv').config()
}

// import express using the require function
const express = require('express')
// creating the var for using the express
const app = express()

// use layout formats inside the layouts folder so importing this one also.
const expressLayouts = require('express-ejs-layouts')
// importing the route path by which is index.js inside the routes which render the index.ejs or layout.ejs
const indexRouter = require('./routes/index')

const bookRouter = require('./routes/books')


// Created seperate route for the author related things
const authorRouter = require('./routes/authors')


// const bodyParser = require('body-parser')

// connection with the local mongoDB
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true
})
const db = mongoose.connection
db.on('error',error=>console.error(error))
db.once('open',()=>console.log("Connected to mongoose")) //if success display

// setting the view to render the files on screen with .ejs extension
app.set('view engine', 'ejs')
// providing the path with the directory name
app.set('views',__dirname+'/views')
// providing the path for the layouts
app.set('layout', 'layouts/layout')

// using the express-ejs layouts
app.use(expressLayouts)
// public for the css or any other files
app.use(express.static('public'))


// using the body parser installed using the npm i body-parser to get the input body text using the <name>
app.use(bodyParser.urlencoded({limit: '10mb', extended: false}))


// starting path render from the index.js inside the route folder
app.use('/',indexRouter)

//using the authors router
app.use('/authors',authorRouter)


app.use('/books',bookRouter)



// providing the port number to run in the localhost.
app.listen(process.env.PORT || 3000)