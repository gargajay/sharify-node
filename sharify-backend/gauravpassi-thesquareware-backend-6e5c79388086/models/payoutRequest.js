const { string, date } = require('@hapi/joi');
const mongoose = require('mongoose');

 const payoutRequestSchema = mongoose.Schema({
    createdOn:{
        type:Date,
        default:Date.now()
    },
    withdrawStatus:{
        type:Number,
        required:false
    },
    amount:{
        type:Number,
        required:false
    },
    bic:{
        type:Number,
        required:false
    },
    start_date:{
        type:Date,
        required:false
    },
    last_date:{
        type:Date,
        required:false
    },
    userbank:{
        type:Object,
        required:false
    },
    user :{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users'
    },

 });

 // user model

 mongoose.model('payoutRequest',payoutRequestSchema);

 // module export
 module.exports = mongoose.model('payoutRequest');