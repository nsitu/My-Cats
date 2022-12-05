const express = require('express')   
const router = express.Router()
const passport =  require ('passport')
const User = require('../models/User')


// login user  
router.post('/login', 
  passport.authenticate('local'),
    (req, res) => {  
      res.sendStatus(200) 
    })


// create a new user 
router.post('/signup', (req, res) => {  
  new User(req.body).save()
    .then(user => {
      console.log(`Account created for ${user.username}`)
      res.json({"success": true, "username": user.username})  
    })
    .catch(err => {
      if (err.code == 11000 && err.keyPattern.username){
        res.json({
          "errors": {
            "username":{
              "message":`User ${err.keyValue.username} already exists.`
            }
          }  
        })  
      }
      else{
        // console.log(err)
        res.status(500).send(err)
      } 
    })
})



router.get('/logout', (req, res, next) => {
  console.log('Logout Requested')
  req.logout((err) => {
    if (err) { return next(err) } 
    res.redirect('/')
  })
})

module.exports = router