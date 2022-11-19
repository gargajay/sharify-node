const { string } = require('@hapi/joi');
const mongoose = require('mongoose');

 const DislinkSchema = mongoose.Schema({
    campaign :{
        type:mongoose.Schema.Types.ObjectId,
        ref:'campaigns'
    },
    user :{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users'
    },
    link:{
        type:String,
        required:false
    },
    createdOn:{
         type:Date,
         default:Date.now()
    } 
 });

 // user model

 mongoose.model('Dislink',DislinkSchema);

 // module export
 module.exports = mongoose.model('Dislink');