 const { string, object } = require('@hapi/joi');
const mongoose = require('mongoose');

 const campaignSchema = mongoose.Schema({
     title:{
         type : String,
         required: [true, 'title required'],
     },
     banner:{
         type:String,
         required:false
     },
     profile:{
         type: String,
         required:false
     },
     description:{
         type:String,
         required:false
     },
     briefing:{
        type:String,
         required:false
     },
     linkAndroid:{
        type:String,
         required:false
     },
     linkIos:{
        type:String,
         required:false
     },
     max_availble_downloads:{
         type:Number,
         required:false
     }, 
     user_per_download:{
         type:Number,
         required:false
     },
     sharify_get_download:{
         type:Number,
         required:false
     },
     campaigns_from_date:{
         type:Date,
          required:false
     },
     campaigns_till_date:{
        type:Date,
        required:false
     },
    status:{
        type:Number,
        required:true,
        default:1
    },
    media : [
        {type: mongoose.Schema.Types.ObjectId,ref:'Media'}
    ],
    calculations:{
        type:Object,
        required:false
    },
    createdOn:{
        type:Date,
        default:Date.now()
    }

 });

 // user model

 mongoose.model('campaigns',campaignSchema);

 // module export
 module.exports = mongoose.model('campaigns');
 