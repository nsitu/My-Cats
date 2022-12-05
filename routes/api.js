
const express = require('express')
const router = express.Router()
const Cat = require("../models/Cat")
const User = require("../models/User")


// the "fs" (filesystem) library lets us store images on Replit.
const fs = require('fs')
// the "path" library helps with the naming of files and folders
const path = require('path')
// set the file upload size limit (i.e. 5MB)
const uploadMaxSize = 5 * 1024 * 1024 
// set the folder where uploads will be stored.
const uploadFolder =  path.resolve( __dirname, '..', 'protected', 'uploads')


// FILE UPLOAD (ENDPOINT)
// listen for a POST request with a file attachment.
router.post("/file", (req, res) => {
  // check if we recieved a file with the name "image"
  if (req.files.image) {   
    // make sure the file isn't too big
    if (req.files.image.size < uploadMaxSize ){  
      // get the file extension of the uploaded image
      const fileExt =  path.extname(req.files.image.name) 
      // generate a new filename based on the current time
      const fileName = new Date().getTime() + fileExt
      // define the destination for the upload
      const destination = path.join(uploadFolder, fileName) 
      // move the uploaded file to its destination
      req.files.image.mv(destination, (err) => { 
        // if successful send the fileName back to the frontend.
        if (!err) res.send({ fileName: fileName }) 
        // if we failed ot move the file, send an error
        else res.status(500).send({error: "File Save Failed"}) 
      })
    }
    else{
      // if the file was too big, send an error
      res.status(400).send({error: "File Too Large"}) 
    }
  }
  else{
    // if no file was received, send an error
    res.status(400).send({error: "File Not Found"}) 
  } 
})

 

// CREATE
router.post('/cat', (req, res) => { 
  // this endpoint looks for JSON data in the body of the request
  delete req.body._id // no need for an id when creting a new cat
  const newCat = req.body
   // assign the new cat to the current logged in user. 
  newCat.human  = req.user._id 
  new Cat(req.body)
    .save()
    .then(cat => { 
      Cat.populate(cat, {path:'human'})
      .then(cat => res.send(cat) )  
    })
    .catch(err => res.status(500).send(err))
})
// READ
router.get('/cats', (req, res) => {   
  let filter = {}
  if (req.query.human){
    filter.human = req.query.human
  }
  let sort = {} 
  if (req.query.sort == "birthDate"){
    sort.birthDate = "ascending"
  }
  if (req.query.sort == "name"){
    sort.name = "descending"
  }  
  Cat.find(filter)
    .populate('human')
    .sort(sort)
    .then(cats => res.send(cats) )
    .catch(err => { 
      console.log(err)
      res.status(500).send(err)
    })
 
 
})

// middleware to check if requested cat is owner by the logged in user 
const isOwnedByUser = (req,res,next) =>{
  Cat.findById(req.params.id)
    .populate('human') 
    .then(cat => {
      if (cat.isOwnedBy(req.user.username)) return next()
      res.sendStatus(401)
    })
    .catch(err => res.status(500).send(err))
}

// get a single cat
router.get('/cat/:id', (req, res) => {  
  Cat.findById(req.params.id)
    .populate('human')
    .then(cat => res.send(cat))
    .catch(err => res.status(500).send(err))
})

//UPDATE
router.put('/cat/:id', isOwnedByUser, (req, res) => {    
  // the ":id" part of the endpoint url is dynamic.
  // we can retrieve it using "req.params.id"
  let options = {new: true}
  let update = req.body
  update.human = req.user._id
  console.log(update)
  Cat.findByIdAndUpdate(req.params.id, update, options)
    .populate('human')
    .then(cat => res.send(cat) )
    .catch(err => res.status(500).send(err)) 
})
 //DELETE
router.delete('/cat/:id', isOwnedByUser, (req, res) => {
  console.log(req.params.id)
  Cat.findByIdAndRemove(req.params.id)
    .then(result => res.send(result) )
    .catch(err => res.status(500).send(err)) 
})


router.get('/user', (req,res) => {
    // When logged in, req.user is available here.
    // let's send it back as JSON, minus the password
    const userData = req.user
    delete userData.password
    res.json(req.user)
})

router.get('/users', (req,res) => { 
  User.find()
    .then(users => {    
      res.json(users.map(user => {
        return{ 
          _id: user._id,
          username: user.username 
        } 
      })) 
    })
    .catch(err => {  
      res.status(500).send(err)
    })  
})


module.exports = router;
