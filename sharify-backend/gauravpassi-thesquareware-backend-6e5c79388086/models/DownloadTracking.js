
const { string } = require('@hapi/joi');
const mongoose = require('mongoose');

 const DownloadTrackingSchema = mongoose.Schema({
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
    DeviceId:{
        type:String,
        required:false
    },
    BundleId:{
        type:String,
        required:false
    },
    BuildVersion:{
        type:String,
        required:false
    },
    sharify_get_download:{
        type:Number,
        required:false
    },
    user_get_download:{
        type:Number,
        required:false
    },
    createdOn:{
         type:Date,
         default:Date.now()
    } 
 });

 // user model

 mongoose.model('DownloadTracking',DownloadTrackingSchema);

 // module export
 module.exports = mongoose.model('DownloadTracking');