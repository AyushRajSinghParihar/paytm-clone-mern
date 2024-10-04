const mongoose = require('mongoose');
const bcrypt = require("bcrypt");


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength: 3,
        maxLength: 30
    },
    //this is a bad practice of storing passwords without hashing (and adding salt) them. Don't do this in prod (it's illegal too in places)
    //Password logic handled at =  routes/user.js and db.js 
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    }
});

const accountSchema = new mongoose.Schema({
    userId: {
        type:mongoose.Schema.Types.ObjectId,
        ref: "User",
        required:true},
    balance: {
        type:Number, 
        required:true
    } 

});


const Account= mongoose.model('Accounts', accountSchema);
const User = mongoose.model('User', userSchema);

module.exports = {
	User,
    Account
};