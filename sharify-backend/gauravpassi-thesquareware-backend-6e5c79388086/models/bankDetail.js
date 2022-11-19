const { string } = require('@hapi/joi');
const mongoose = require('mongoose');

 const bankDetailSchema = mongoose.Schema({
     company:{
         type : String,
         required: [true, 'company required'],
     },
     company_address:{
         type:String,
         required:true
     },
     additional_optional:{
        type:String,
        required:false
    },
     postal_code:{
         type: String,
         required:false
     },
     city:{
         type:String,
         required:false
     },
     country:{
        type:String,
         required:false
     },
     account_holder:{
         type:String,
         required:false
     }, 
     iban:{
         type:String,
         required:false
     },
     tax_information_person:{
        type:Number,
        required:false
    },
     bic:{
         type:String,
         required:false
     },
    tax_number:{
        type:String,
        required:false
    },
    createdOn:{
        type:Date,
        default:Date.now()
    },
    user :{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users'
    },

 });

 // user model

 mongoose.model('bankDetail',bankDetailSchema);

 // module export
 module.exports = mongoose.model('bankDetail');