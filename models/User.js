const mongoose = require('mongoose')
const bcrypt = require('bcrypt') 

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: 'Username is required',
    }, 
    password: {
        type: String,
        required: 'Password is required',
        max: 100
    }
}, {timestamps: true})


// Mongoose pre-save hook:
// If the user changed their password hash it with bcrypt prior to saving. 
UserSchema.pre('save',  function(next)  {
  // TODO: can we just use "this" throughout? instead of "user" ? 
    const user = this
    if (!user.isModified('password')) return next() 
    bcrypt.genSalt(10, function(err, salt) {
        if (err) return next(err) 
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err) 
            user.password = hash
            next()
        })
    })
})

// During login, compare the password attempt to the actual password.
UserSchema.methods.verifyPassword = function(password) {
    return bcrypt.compareSync(password, this.password)
}
 
module.exports = mongoose.model('User', UserSchema)