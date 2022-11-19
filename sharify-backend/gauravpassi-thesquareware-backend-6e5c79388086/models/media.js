 const { string } = require('@hapi/joi');
const mongoose = require('mongoose');

 const mediaSchema = mongoose.Schema({
    media:{
         type : String,
         required: [true, 'title required'],
    },

    link:{
         type : String,
         required: [true, 'Link required'],
    }, 
    mediatype:{
        type:String,
        required:false
    }, 
    status:{
        type:Number,
        required:false,
        default:1
    },
    campaign :{
        type:mongoose.Schema.Types.ObjectId,
        ref:'campaign'
    },
    createdOn:{
         type:Date,
         default:Date.now()
    } 
 });

 // user model

 mongoose.model('media',mediaSchema);

 // module export
 module.exports = mongoose.model('media');