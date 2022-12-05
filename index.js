
/* See also: https://www.npmjs.com/package/cors */
const cors = require('cors')
// Mongoose for interacting with MongoDB
// See also: https://mongoosejs.com/
const mongoose = require('mongoose')
// Express framework for building web apps
// See also: https://expressjs.com/
const express = require('express')
// include and activate express file upload middleware
const fileUpload = require('express-fileupload') 
// passport
const passport = require ('passport')
// Initialize Express
const app = express()
// Setup Session middleware for express.
const session = require('express-session')
// It's important to set a SESSION_SECRET in your environment. (the default value is not secure)
const sessionSecret = process.env.SESSION_SECRET || 'my_default_secret_12345'
// NOTE: by default, sessions are stored in memory (RAM)
// If scalability matters, you could store sessions in MongoDB instead
app.use( session({ 
  secret: sessionSecret, 
  resave: false, 
  saveUninitialized: true
}))

 // enable file upload middleware
app.use(fileUpload())
// enable direct parsing of json data
app.use(express.json()) 
// Tell our Express app to add CORS headers
app.use(cors())
// Initialize passport (authentication middleware)
app.use(passport.initialize())  
// tell passport to use the above session.
app.use(passport.session())    

// tell passport to implement our login strategy.
passport.use( require ('./auth/strategy') ) 
// Passport.serializeUser persists user data in the session
passport.serializeUser( (user, done) => { done(null, user) })
//  Passport.deserializeUser retrieves user data from session
passport.deserializeUser( (user, done) => { done(null, user) })

// Middleware to check whether user is logged in 
const isLoggedIn = require('./auth/check').isLoggedIn 
// Serve up public files (e.g. login page)
app.use('/login', express.static('public')) 
// Publish endpoints for processing signup, login, logout etc.
app.use('/auth', require('./routes/auth'))   
// api endpoints require an authentication check
app.use('/api', isLoggedIn,  require('./routes/api')) 
// protected area requires authentication check
app.use('/', isLoggedIn, express.static('protected')) 



/* Connect to MongoDB:
To connect, you must add a MongoDB connection string
as an environment variable (i.e. Replit "Secret")
The name/key of the environment variable must be "MONGODB"
The value of the variable must be a valid MongoDB connection string. 
You can locate the string in your MongoDB Atlas dashboard. */
mongoose.connect( process.env.MONGODB, (error) => {  
  if (error) handleError(error)
  else {
    console.log("MongoDB connected.")
    // Tell express to start listening
    // but only after MongoDB is connected
    app.listen(()=>{
      console.log("Express is live.")
    })
  } 
}).catch((error) => handleError(error));

// Error Handler for MongoDB:
// If there are any issues with MongoDB, 
// we will log them to the console. 
const handleError = (error)=>{
  console.log("MongoDB connection failed.")
  console.log(error.message)
  if (process.env.MONGODB){
    console.log("MONGODB="+process.env.MONGODB) 
  }    
  else{
    console.log("MONGODB environment variable not found.") 
  }
}