const { string } = require('@hapi/joi');
const mongoose = require('mongoose');

 const LinkTrackingSchema = mongoose.Schema({
    campaign :{
        type:mongoose.Schema.Types.ObjectId,
        ref:'campaigns'
    },
    user :{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users'
    },
    ipAddress:{
         type : String,
         required: [true, 'ip reqiured'],
    },
    AppName:{
        type:String,
        required:true
    },
    osName:{
        type:String,
        required:false
    },
    mobileVendor:{
        type:String,
        required:false
    },
    mobileModel:{
        type:String,
        required:false
    },
    createdOn:{
         type:Date,
         default:Date.now()
    } 
 });

 // user model

 mongoose.model('LinkTracking',LinkTrackingSchema);

 // module export
 module.exports = mongoose.model('LinkTracking');