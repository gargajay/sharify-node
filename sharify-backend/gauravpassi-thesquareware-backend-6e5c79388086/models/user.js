 const { string } = require('@hapi/joi');
const mongoose = require('mongoose');

 const userSchema = mongoose.Schema({
     username:{
         type : String,
         required:true
     },
     email:{
         type:String,
         required:true,
         unique:true,
     },
     password:{
         type: String,
         required:true
     },
     status:{
         type:Number,
         default:1
     },
     resetToken:{
        type: String
     },
     expireToken:{
        type:Date
     },
     role:{
         type:Number,
         required:true
     },
     createdOn:{
         type:Date,
         default:Date.now()
     }

 });

 // user model

 mongoose.model('users',userSchema);

 // module export
 module.exports = mongoose.model('users');