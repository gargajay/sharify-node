var DeviceDetector = require("device-detector-js");

const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { check, validationResult } = require('express-validator');
const joi = require('@hapi/joi');
var multer = require('multer'); 
const config = require('config');
const path = require('path');
const { smtpServer, smtpPort, smtpUser, smtpPass } = config.get('smtp');
const { WEB_URL, SECERT_KEY } = config.get('appConstants');
const nodemailer = require("nodemailer");
const Validator = require('validatorjs');
const User = require('./../models/user');
const campaignModel = require('./../models/campaign');
const Media = require('./../models/media');
const { create } = require('./../models/user');
const LinkTracking = require('./../models/LinkTracking');
const bankDetailModel = require('./../models/bankDetail');
const payoutRequest = require('./../models/payoutRequest');
const axios = require('axios');
var  Moment = require("moment"); 





var appRoot = require('app-root-path');
const user = require('./../models/user');
const requestIp = require('request-ip');
const DownloadTracking = require('../models/DownloadTracking');
const dislink = require("../models/dislink");


 
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },

    // By default, multer removes file extensions so let's add them back
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

module.exports.sendImage = (req, res) => {
    return res.sendFile(`${appRoot}${req.path}`);
};

// find user 
module.exports.findEmail = async function(req, res) {
    User.find({ email: req.params.email }, function (error, result) {

        if (error) {
            return res.json({
                status: false,
                message: "fail ",
                error: error
            });
        }

        return res.json({
            status: true,
            message: "find successfully",
            result: result
        });


    });

};

// register user
module.exports.register = async function(req, res) { 
        // validation 
        var randomstring = require("randomstring");
        const { name, email, password } = req.body;

        const validation = joi.object({
            username: joi.string().min(7).required(),
            email: joi.string().email().max(256).required(),
            password: joi.required()


        });
        let validationResult = validation.validate(req.body);
        const hashedpassword = bcrypt.hashSync(req.body.password, 10);

        const verifytoken =  randomstring.generate();
        /// ok
        // insert record with create method
        var myuser = new User({
            username: req.body.username,
            email: req.body.email.toLowerCase(),
            role: 2,
            password: hashedpassword,
            status: 2,
            resetToken:verifytoken
        });




        myuser.save(function (error, result) {
            if (error) {
                if (11000 === error.code || 11001 === error.code){
                var msg = "email is already registered";
                }else{
                    var msg = error.message;
                }
                return res.json({
                    success: false,
                    msg: msg,
                    error: error
                });
            }

            async function main() {
                let transporter = nodemailer.createTransport({
                    host: smtpServer,
                    port: smtpPort,
                    secure: false,
                    auth: {
                        user: smtpUser,
                        pass: smtpPass,
                    },
                });

                var currentTime = new Date();

                // send mail with defined transport object
                let info = await transporter.sendMail({
                    from: '"Sharify👻" <info@sharify.com>', // sender address
                    to: req.body.email, // list of receivers
                    subject: "Account verificaton", // Subject line
                    html: "<h1>Welcome to sharify !</h1><p><h3>hello user</h3></br> Please click on the below link to verify your account </br><a href='" + WEB_URL + "account-verification/" + verifytoken + "'>Click here</a></p>", // html body
                });

                if (info.messageId) {

                    return res.json({
                        success: true,
                        msg: "Please check your email mail sent",

                    });

                }

            }
            main().catch(console.error);
            // res.json({
            //     success: true,
            //     msg: "Profile Created",

            // })
        });

};


module.exports.sendmail = async function(req, res) {  
        "use strict";
        const nodemailer = require("nodemailer");

        // async..await is not allowed in global scope, must use a wrapper
        async function main() {
            // Generate test SMTP service account from ethereal.email
            // Only needed if you don't have a real mail account for testing
            let testAccount = await nodemailer.createTestAccount();

            // create reusable transporter object using the default SMTP transport


            let transporter = nodemailer.createTransport({
                host: smtpServer,
                port: smtpPort,
                secure: false,
                auth: {
                    user: smtpUser,
                    pass: smtpPass,
                },
            });

            var currentTime = new Date();

            // send mail with defined transport object
            let info = await transporter.sendMail({
                from: '"Sharify👻" <info@sharify.com>', // sender address
                to: user.email, // list of receivers
                subject: "reset  password", // Subject line
                text: "Hello world?", // plain text body
                html: "<h1>Welcome to sharify !</h1><p><h3>hello user</h3></br> Please click on the below link to reset your password </br><a href='" + WEB_URL + "change-password/" + currentTime + "+++email'>Click here</a>/</p>", // html body
            });

            if (info.messageId) {
                res.send("sent");
            }
            console.log("Message sent: %s", info.messageId);
            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

            // Preview only available when sending through an Ethereal account
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
            // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
        }

        main().catch(console.error);
};

module.exports.forgotpassword = async function(req, res) {  
 
        crypto.randomBytes(32, (err, buffer) => {
            if (err) {
                console.log(err);
            }

            const token = buffer.toString("hex");

            User.findOne({ email: req.body.email.toLowerCase() }).then(user => {

                if (user) {



                    user.resetToken = token;
                    user.expireToken = Date.now() + 3600000;
                    user.save().then((response) => {
                        async function main() {
                            let transporter = nodemailer.createTransport({
                                host: smtpServer,
                                port: smtpPort,
                                secure: false,
                                auth: {
                                    user: smtpUser,
                                    pass: smtpPass,
                                },
                            });

                            var currentTime = new Date();

                            // send mail with defined transport object
                            let info = await transporter.sendMail({
                                from: '"Sharify👻" <info@sharify.com>', // sender address
                                to: user.email, // list of receivers
                                subject: "reset  password", // Subject line
                                html: "<h1>Welcome to sharify !</h1><p><h3>hello user</h3></br> Please click on the below link to reset your password </br><a href='" + WEB_URL + "reset-password/" + token + "'>Click here</a></p>", // html body
                            });

                            if (info.messageId) {

                                return res.json({
                                    success: true,
                                    msg: "Please check your mail and reset password",

                                });

                            }

                        }

                        main().catch(console.error);


                    }).catch(console.error);

                } else {
                    return res.json({
                        success: false,
                        msg: "No user found with this email!",
                    });
                }

            })


        });



};


module.exports.resetpassword = async function(req, res) {  

        const newPassword = req.body.password;
        const setToken = req.body.token;



        User.findOne({ resetToken: setToken, expireToken: { $gt: Date.now() } })
            .then(user => {
                if (!user) {
                    return res.json({
                        success: false,
                        msg: "token expire",
                    });
                }

                bcrypt.hash(newPassword, 10).then(hashedpassword => {
                    user.password = hashedpassword
                    user.resetToken = null
                    user.expireToken = null
                    user.save().then((saveduser) => {
                        res.json(
                            {
                                success: true,
                                msg: 'Password updated successfully'

                            }
                        )
                    })
                })


            }).catch(err => {
                console.log(err)
            })

} 

module.exports.verifyaccount = async function(req, res) {  

       
        const setToken = req.body.token;



        User.findOne({ resetToken: setToken})
            .then(user => {
                if (!user) {
                    return res.json({
                        success: false,
                        msg: "token expire .try again",
                    });
                }

                    user.resetToken = null
                    user.expireToken = null
                    user.status=1
                    user.save().then((saveduser) => {
                        res.json(
                            {
                                success: true,
                                msg: 'Account verify successfully'

                            }
                        )
                    })
               


            }).catch(err => {
                console.log(err)
            })

} 

// update profile
module.exports.updateprofile = async function(req, res) {  
        // validation 
        
        const validation = joi.object({
            username: joi.string().min(5).required(),
            password: joi.string().max(256).required(),
            old_password: joi.required()


        });

        let validationResult = validation.validate(req.body);

       
       

        const { username, password, old_password,token} = req.body;

        try {
            const decoded = jwt.verify(token, SECERT_KEY);

            req.user = decoded;

            User.findById(req.user.id)
                .then(user =>
                     {
                  
                    if(!user){
                        return res.json({msg : 'User Does not exist', success : false})
                    }

                    if(password !="" && password != null)
                    {
                        bcrypt.compare(old_password, user.password)
                    .then(isMatch => {
                        if(!isMatch){
                            return res.json({msg : 'old password not match! ', success : false})
                        }
    
                        user.password = bcrypt.hashSync(password,10);
                        user.username = req.body.username;
                        user.save().then((saveduser) => {
                            if(!saveduser){
                                res.json(
                                    {
                                        success: false,
                                        msg: 'Try Again !'
        
                                    }
                                )
                            }
                            res.json(
                                {
                                    success: true,
                                    msg: 'Profile updated successfully',
                                    user : {
                                        id : user.id,
                                        username : user.username,
                                        email : user.email,
                                        token:req.body.token,
                                        role:user.role
                                    }
    
                                }
                            )
                        })
                    })
                    }else{
                        user.username = req.body.username;
                        user.save().then((saveduser) => {
                            if(!saveduser){
                                res.json(
                                    {
                                        success: false,
                                        msg: 'Try Again !'
        
                                    }
                                )
                            }
                            res.json(
                                {
                                    success: true,
                                    msg: 'Profile updated successfully',
                                    user : {
                                        id : user.id,
                                        username : user.username,
                                        email : user.email,
                                        token:req.body.token,
                                        role:user.role
                                    }
    
                                }
                            )
                        })
                    }

                    
                })
                .catch(err => {
                    return res.json({'msg' : 'User not found', success : false})
                })
        }

        catch (e) {
            return res.json({msg : 'Token not valid', success : false})
        }

     
}; 


module.exports.addFeeds = async function(req, res) { 
        // validation 

        let upload = multer({ storage: storage}).array('feeds',20);

        upload(req,res,function(err) {
            
            var images=[];
            for (var i=0; i<req.files.length; i++){

              console.log(req.files[i]);

                var videotype=  validateVideoFileExtension(req.files[i].filename);

                let med = new Media({
                    media: videotype ? 'video':'image',
                    mediatype: 'feeds',
                    link: req.files[i].filename,
                  })
                  med.save();
                images[i]=req.files[i].filename;
            }

            

            if(err) {
                return res.end("Error uploading file.");
            }else{

                
            
              

                if(images){
                    res.json({'status':true,'data':images});

                }else{
                    res.json({'status':false,'data':images});
                } 
            }
        }); 
   

};


module.exports.addStory = async function(req, res) { 
        // validation 

        let upload = multer({ storage: storage}).array('stories',20);

        upload(req,res,function(err) {
            console.log(req.body);
            console.log(req.files);

            var images=[];
            for (var i=0; i<req.files.length; i++){

                var videotype=  validateVideoFileExtension(req.files[i].filename);

                  
                    let med = new Media({
                      media: videotype ? 'video':'image',
                      mediatype: 'stories',
                      link: req.files[i].filename,
                    })
                    med.save();

                images[i]=req.files[i].filename;
                console.log(req.files[i].filename);
            }

            console.log(images);
            if(err) {
                return res.end("Error uploading file.");
            }else{ 
                if(images){
                    console.log(req.body);
                    res.json({'status':true,'data':images});

                }else{
                    res.json({'status':false,'data':images});
                } 
            }
        }); 
   

};


module.exports.addProfile = async function(req, res) { 
    // validation 

    let upload = multer({ storage: storage}).array('profile',20);

    upload(req,res,function(err) {
        console.log(req.body);
        console.log(req.files);

        var images=[];
        for (var i=0; i<req.files.length; i++){
            images[i]=req.files[i].filename;
            console.log(req.files[i].filename);
        }

        console.log(images);
        if(err) {
            return res.end("Error uploading file.");
        }else{ 
            if(images){
                console.log(req.body);
                res.json({'status':true,'data':images});

            }else{
                res.json({'status':false,'data':images});
            } 
        }
    }); 


};


module.exports.addBanner = async function(req, res) { 
    // validation 

    let upload = multer({ storage: storage}).array('banner',20);

    upload(req,res,function(err) {
        console.log(req.body);
        console.log(req.files);

        var images=[];
        for (var i=0; i<req.files.length; i++){
            images[i]=req.files[i].filename;
            console.log(req.files[i].filename);
        }

        console.log(images);
        if(err) {
            return res.end("Error uploading file.");
        }else{ 
            if(images){
                console.log(req.body);
                res.json({'status':true,'data':images});

            }else{
                res.json({'status':false,'data':images});
            } 
        }
    }); 


};


module.exports.updateUpload = async function(req, res) { 
    // validation 

    var name = req.params.name;
    var camid = req.params.camid;




    
        var upload = multer({ storage: storage}).array('stories',20);


        if(name==='feeds'){
            upload = multer({ storage: storage}).array('feeds',20);

        }else if(name=='banner'){
            upload = multer({ storage: storage}).array('banner',20);

        }else if(name=='profile'){
            upload = multer({ storage: storage}).array('profile',20);

        }

   
        
    


    upload(req,res,function(err) {
       

        var images=[];
        for (var i=0; i<req.files.length; i++){



            var videotype=  validateVideoFileExtension(req.files[i].filename);

                  
                    let med = new Media({
                      media: videotype ? 'video':'image',
                      mediatype: name,
                      link: req.files[i].filename,
                      campaign:camid
                    })
                    med.save();

                    
                


            images[i]=req.files[i].filename;
            console.log(req.files[i].filename);
        }

        if(err) {
            return res.end("Error uploading file.");
        }else{ 
            if(images){
                console.log(req.body);
                res.json({'status':true,'data':images});

            }else{
                res.json({'status':false,'data':images});
            } 
        }
    }); 


};

module.exports.addCampaigns = async function(req, res) { 
        // validation 
        var path = require('path')

        // res.json(req.body); return;
        let msg = new campaignModel({
          title: req.body.title,
          banner: req.body.banner[0],
          profile: req.body.profile[0],
          description: req.body.description,
          briefing: req.body.briefing,
          max_availble_downloads: req.body.max_availble_downloads,
          user_per_download: req.body.user_per_download,
          sharify_get_download: req.body.sharify_get_download,
          campaigns_from_date: req.body.campaigns_from_date,
          campaigns_till_date: req.body.campaigns_till_date,
          linkAndroid: req.body.linkAndroid,
          linkIos: req.body.linkIos
        })

        

        msg.save().then(doc => {

         

            if(Array.isArray(req.body.feeds)){
                req.body.feeds.forEach(async function(value, key) 
                {
                

                  var videotype=  validateVideoFileExtension(value);

                  
                    let med = new Media({
                      media: videotype ? 'video':'image',
                      mediatype: 'feeds',
                      link: value,
                      campaign:msg._id
                    })
                    med.save();

                    const camp = await campaignModel.findById(msg._id);
                    camp.media.push(med);
                    await camp.save();
                   })
                }

                if(Array.isArray(req.body.stories)){
                    req.body.stories.forEach(async function(value, key) 
                    {
                        var videotype=  validateVideoFileExtension(value);

                    
                        let med = new Media({
                            media: videotype ? 'video':'image',
                            mediatype: 'stories',
                          link: value,
                          campaign:msg._id
                        })
                        med.save();
    
                        const camp = await campaignModel.findById(msg._id);
                        camp.media.push(med);
                        await camp.save();
                       })
                    }


                    
               res.json({'status':true,'data':req.body});


        }).catch(err => {
            console.log(err);
            res.json({'status':false,'data':[]});
        
        })
   

};




    function validateVideoFileExtension(fld_value) {

        const mime = require('mime');

          var type = mime.getType(fld_value);
    	  var r=type.search('video');
      if(r !== -1){
       return true;
      }

      return false;
    }



module.exports.edit_campaign = async function(req, res) { 
        // validation 

        // res.json(req.body); return;
        
        const filter = { _id: req.body.id };
        const update = {
          title: req.body.title,
          banner: req.body.banner[0],
          profile: req.body.profile[0],
          description: req.body.description,
          briefing: req.body.briefing,
          max_availble_downloads: req.body.max_availble_downloads,
          user_per_download: req.body.user_per_download,
          sharify_get_download: req.body.sharify_get_download,
          campaigns_from_date: req.body.campaigns_from_date,
          campaigns_till_date: req.body.campaigns_till_date,
          linkAndroid: req.body.linkAndroid,
          linkIos: req.body.linkIos
        }

        // `doc` is the document _after_ `update` was applied because of
        // `new: true`
        let updated = await campaignModel.findOneAndUpdate(filter, update, {
          new: true
        }); 

        if(updated){

           

            res.json({'status':true,'data':req.body});

        }
   

};



module.exports.getCampaigns = async function(req , res){



    const authors = await campaignModel.find({'status':1} );// 1 = status achrived 2= status pause

 
    var arr=[];
    for (var i=0; i<authors.length; i++){

        var obj = []; 
        var len=authors[i].media.length;
        
       
        
        var  linkClickCount = await LinkTracking.find({ campaign: authors[i]._id }).count();
        var  linkDownloadCount = await DownloadTracking.find({ campaign: authors[i]._id }).count();
        var  linkdis = await dislink.find({ campaign: authors[i]._id }).count();
        var  conversion = (parseInt(linkDownloadCount)*100)/parseInt(linkClickCount);
        var  Download = await DownloadTracking.find({ campaign: authors[i]._id }).populate('campaign');


        if(Download)
        {
            var total = 0;
            for (var p=0; p<Download.length; p++){

               total =  total + parseInt(Download[p].campaign.user_per_download);

              
            }

            var avarage =(parseInt(total)/parseInt(linkDownloadCount));
            avarage = (avarage).toFixed(1);

             
        }
var aviable_download = 0;
        if(authors[i].max_availble_downloads > linkDownloadCount){
           var rem  = parseInt(authors[i].max_availble_downloads) - parseInt(linkDownloadCount); 

           aviable_download =  (rem * 100)/parseInt(authors[i].max_availble_downloads);
        }
        aviable_download = (aviable_download).toFixed();
        const data2 ={
            linkClickCount,
            linkDownloadCount,
            total,
            aviable_download,
            linkdis
        }
 
        
         authors[i].calculations = data2;
        

    } 
     

    if (arr) {
      res.json({'status':true,'data':authors});
    } else {
      res.json({'status':false,'data':[]});
    }

     
}


module.exports.getuserCampaigns = async function(req , res){

    // var today = Moment(Date.now()).format('YYYY-MM-DD');

    // var last = new ISODate(today);


    const authors = await campaignModel.find({status:1,"campaigns_from_date":{"$lte":new Date()}} );// 1 = status achrived 2= status pause

 
    var arr=[];
    for (var i=0; i<authors.length; i++){

        var obj = []; 
        var len=authors[i].media.length;
        
       
        
        var  linkClickCount = await LinkTracking.find({ campaign: authors[i]._id }).count();
        var  linkDownloadCount = await DownloadTracking.find({ campaign: authors[i]._id }).count();
        var  linkdis = await dislink.find({ campaign: authors[i]._id }).count();
        var  conversion = (parseInt(linkDownloadCount)*100)/parseInt(linkClickCount);
        var  Download = await DownloadTracking.find({ campaign: authors[i]._id }).populate('campaign');


        if(Download)
        {
            var total = 0;
            for (var p=0; p<Download.length; p++){

               total =  total + parseInt(Download[p].campaign.user_per_download);

              
            }

            var avarage =(parseInt(total)/parseInt(linkDownloadCount));
            avarage = (avarage).toFixed(1);

             
        }
var aviable_download = 0;
        if(authors[i].max_availble_downloads > linkDownloadCount){
           var rem  = parseInt(authors[i].max_availble_downloads) - parseInt(linkDownloadCount); 

           aviable_download =  (rem * 100)/parseInt(authors[i].max_availble_downloads);
        }
        aviable_download = (aviable_download).toFixed();
        const data2 ={
            linkClickCount,
            linkDownloadCount,
            total,
            aviable_download,
            linkdis
        }
 
        
         authors[i].calculations = data2;
        

    } 
     

    if (arr) {
      res.json({'status':true,'data':authors});
    } else {
      res.json({'status':false,'data':[]});
    }

     
}




module.exports.getActiveCampaigns = async function(req , res){

    

    const authors = await campaignModel.find({'status': { $ne: 3 }
} );// 1 = status achrived 2= status pause

 
    var arr=[];
    for (var i=0; i<authors.length; i++){

        var obj = []; 
        var len=authors[i].media.length;
        
       
        
        var  linkClickCount = await LinkTracking.find({ campaign: authors[i]._id }).count();
        var  linkDownloadCount = await DownloadTracking.find({ campaign: authors[i]._id }).count();
        var  linkdis = await dislink.find({ campaign: authors[i]._id }).count();

        var  conversion = (parseInt(linkDownloadCount)*100)/parseInt(linkClickCount);
        var  Download = await DownloadTracking.find({ campaign: authors[i]._id }).populate('campaign');


        if(Download)
        {
            var total = 0;
            for (var p=0; p<Download.length; p++){

               total =  total + parseInt(Download[p].campaign.user_per_download);

              
            }

            var avarage =(parseInt(total)/parseInt(linkDownloadCount));
            avarage = (avarage).toFixed(1);

             
        }
var aviable_download = 0;
        if(authors[i].max_availble_downloads > linkDownloadCount){
           var rem  = parseInt(authors[i].max_availble_downloads) - parseInt(linkDownloadCount); 

           aviable_download =  (rem * 100)/parseInt(authors[i].max_availble_downloads);
        }
aviable_download = (aviable_download).toFixed();
        const data2 ={
            linkClickCount,
            linkDownloadCount,
            total,
            aviable_download,
            linkdis
        }
 
        
         authors[i].calculations = data2;
        

    } 
     

    if (arr) {
      res.json({'status':true,'data':authors});
    } else {
      res.json({'status':false,'data':[]});
    }

     
}


module.exports.getArchivedCampaigns = async function(req , res){

    

    const authors = await campaignModel.find( {'status':3 ,
} ); // 3 = status achrived

 
    var arr=[];
    for (var i=0; i<authors.length; i++){

        var obj = []; 

        var  linkClickCount = await LinkTracking.find({ campaign: authors[i]._id }).count();
        var  linkDownloadCount = await DownloadTracking.find({ campaign: authors[i]._id }).count();
        var  conversion = (parseInt(linkDownloadCount)*100)/parseInt(linkClickCount);
        var  linkdis = await dislink.find({ campaign: authors[i]._id }).count();

        var  Download = await DownloadTracking.find({ campaign: authors[i]._id }).populate('campaign');


        if(Download)
        {
            var total = 0;
            for (var p=0; p<Download.length; p++){

               total =  total + parseInt(Download[p].campaign.user_per_download);

              
            }

            var avarage =(parseInt(total)/parseInt(linkDownloadCount));
            avarage = (avarage).toFixed(1);

             
        }
var aviable_download = 0;
        if(authors[i].max_availble_downloads > linkDownloadCount){
           var rem  = parseInt(authors[i].max_availble_downloads) - parseInt(linkDownloadCount); 

           aviable_download =  (rem * 100)/parseInt(authors[i].max_availble_downloads);
        }
        aviable_download = (aviable_download).toFixed();
        const data2 ={
            linkClickCount,
            linkDownloadCount,
            total,
            aviable_download,
            linkdis
        }
 
        
         authors[i].calculations = data2;
         
 
        
        // authors[i].media.push(obj);
    

    } 
     

    if (arr) {
      res.json({'status':true,'data':authors});
    } else {
      res.json({'status':false,'data':[]});
    }

     
}




module.exports.getCampaignByid = async function(req , res){

    //const authors = await campaignModel.find();
    if(req.params.id!=''){

    var data= await campaignModel.findOne({ _id: req.params.id });
    // res.json(data); return;
        if(data){

            var media=await Media.find({campaign: data.id }).sort({$natural:-1});
            res.json({'status':true,'data':media});
            return;
        }else{
            res.json({'status':false,'message':'No Data found'});    
        }

    }else{
        res.json({'status':false,'message':'No Data found'});
    }



    var arr=[];
    for (var i=0; i<authors.length; i++){

        var obj = []; 
        var len=authors[i].media.length;
        
        for (var j=0; j < len; j++){
            
            var media=await Media.findOne({ _id: authors[i].media[j] });
           
            obj.push(media);
        }   
 
        authors[i].med=obj; 
        arr[i]=authors[i];
        arr[i]['me']=authors[i].med; 
    } 


     

    if (arr) {
      res.json({'status':true,'data':arr});
    } else {
      res.json({'status':false,'data':[]});
    }

     
}
module.exports.getMedia=async function (req,res) {
    var campid= req.params.campid; 
    if(campid){

        var media=await Media.find({campaign: campid });

        if (!media) {
          res.json({'status':false,'data':[],'message':'No data found'});
        } else {
          res.json({'status':true,'data':media});
        }
    }else{
        res.json({'status':false,'data':[],'message':'Please provide campaign id'});
    }
}

// for user media campign story and feeds

module.exports.getMediaUser=async function (req,res) {
    var campid= req.params.campid; 
    if(campid){


        if(req.params.mediatype!=''){

            // var data= await campaignModel.findOne({ _id: req.params.id });
            var media=await Media.find({campaign: campid,mediatype: req.params.mediatype,status:1 });
        }else{
            var media=await Media.find({campaign: campid });
        }


        if (!media) {
          res.json({'status':false,'data':[],'message':'No data found'});
        } else {
          res.json({'status':true,'data':media});
        }
    }else{
        res.json({'status':false,'data':[],'message':'Please provide campaign id'});
    }
}






module.exports.getAllMedia=async function (req,res)
 {

    console.log(req.params.mediatype);
        
        if(req.params.mediatype === undefined ||  req.params.mediatype===""){

            var media=await Media.find().sort({$natural:-1});
            // var data= await campaignModel.findOne({ _id: req.params.id });
            
        }else{
            var media=await Media.find({ mediatype: req.params.mediatype }).sort({$natural:-1});
        }


      

        if (!media) {
          res.json({'status':false,'data':[],'message':'No data found'});
        } else {
          res.json({'status':true,'data':media});
        }
    
}


module.exports.getUsers = async function(req , res){
    User.find({ role: { $ne: '1' },status:{$ne:'4'} }, function(err, result) {
        if (err) {
          res.json({'status':false,'data':req.body});
        } else {
          res.json({'status':true,'data':result});
        }
    });
}

module.exports.updateUserStatus=async function(req,res) {
    try {
            // const decoded = jwt.verify(token, SECERT_KEY);

            // req.user = decoded;

            User.findById(req.body.userid).then(user =>
            {
                  
                    if(!user){
                        return res.json({msg : 'User Does not exist', success : false})
                    }

                    if(user)
                    {
                        
                        user.status = req.body.status;
                        user.save().then((saveduser) => {
                            if(!saveduser){
                                res.json(
                                    {
                                        success: false,
                                        msg: 'Try Again !'
                                    }
                                )
                            }
                            res.json(
                                {
                                    success: true,
                                    msg: 'Updated successfully'
    
                                }
                            )
                        });

                    }

                    
                })
                .catch(err => {
                    return res.json({'msg' : 'User not found', success : false})
                })
        }

        catch (e) {
            return res.json({msg : 'Token not valid', success : false})
        }
}

module.exports.mediaStatusChange=async function(req,res) {
   
    var media=await Media.findById(req.body.mediaid);
    // var media=await Media.find({campaign: campid });
    if(media){
        
        media.status = req.body.status;
        media.save().then((saveduser) => {
            if(!saveduser){
                res.json(
                    {
                        success: false,
                        msg: 'Try Again !'
                    }
                )
            }
            res.json(
                {
                    success: true,
                    msg: 'Updated successfully'

                }
            )
        });
    }else{
        res.json(
                {
                    success: true,
                    msg: 'Not found'

                }
            )
    }
}

module.exports.deleteMedia=async function(req,res) {
   
    var media=await Media.findById(req.body.mediaid);
    // var media=await Media.find({campaign: campid });
    if(media){
        
        Media.deleteOne({ _id: req.body.mediaid }, function (err) {
          if(err) console.log(err);
          
            res.json(
                {
                    success: true,
                    msg: 'Media deleted successfully'

                }
            )
        });
    }else{
        res.json(
                {
                    success: true,
                    msg: 'Not found'

                }
            )
    }
}


module.exports.deleteCompaign=async function(req,res) {
   
    var campaign=await campaignModel.findById(req.body.id);
    // var media=await Media.find({campaign: campid });
    if(campaign){
        
        campaignModel.deleteOne({ _id: req.body.id }, function (err) {
          if(err) console.log(err);
          
            res.json(
                {
                    success: true,
                    msg: 'deleted successfully'

                }
            )
        });
    }else{
        res.json(
                {
                    success: true,
                    msg: 'Not found'

                }
            )
    }
}


module.exports.deleteUser=async function(req,res) {
   
    User.findById(req.body.userid)
             .then(user =>
                 {              
                 if(!user){
                     return res.json({msg : 'User Does not exist', success : false})
                 }
                 user.status = 4;
                 user.save().then((saveduser) => {
                         if(!saveduser){
                             res.json(
                                 {
                                     success: false,
                                     msg: 'Try Again !'
     
                                 }
                             )
                         }
                         res.json(
                             {
                                 success: true,
                                 msg: 'User Deleted successfully',
                                
 
                             }
                         )
                     });
             })
             .catch(err => {
                 return res.json({'msg' : 'User not found', success : false})
             })
}

//

module.exports.addAdmin = async function(req, res) { 
    // validation 
    
    /// ok
    // insert record with create method
    var myuser = new User({
        username: 'admin',
        email: 'admin@admin.com',
        role: 1,
        password: bcrypt.hashSync('12345678',10),
        status: 1,
    });




    myuser.save(function (error, result) {
        if (error) {
            if (11000 === error.code || 11001 === error.code){
            var msg = "email is already registered";
            }else{
                var msg = error.message;
            }
            return res.json({
                success: false,
                msg: msg,
                error: error
            });
        }

     
    });

};

module.exports.deleteaccount = async function(req, res) {  
  
    const { status,token} = req.body;
 
     try {
         const decoded = jwt.verify(token, SECERT_KEY);
 
         req.user = decoded;
         
         User.findById(req.user.id)
             .then(user =>
                 {              
                 if(!user){
                     return res.json({msg : 'User Does not exist', success : false})
                 }
                 user.status = 4;
                 user.save().then((saveduser) => {
                         if(!saveduser){
                             res.json(
                                 {
                                     success: false,
                                     msg: 'Try Again !'
     
                                 }
                             )
                         }
                         res.json(
                             {
                                 success: true,
                                 msg: 'Account Deleted successfully',
                                 user : {
                                     id : user.id,
                                     username : user.username,
                                     email : user.email,
                                     token:req.body.token,
                                     role:user.role
                                 }
 
                             }
                         )
                     });
             })
             .catch(err => {
                 return res.json({'msg' : 'User not found', success : false})
             })
     }
 
     catch (e) {
         return res.json({msg : 'Token not valid', success : false})
     }
 
  
 }; 


 module.exports.linkClicking = async function(req, res) {  
   
    const ogipAddress = requestIp.getClientIp(req); 

    let buff = new Buffer(ogipAddress);
    let base64data = buff.toString('base64');

    console.log(base64data);

    const ipAddress = base64data; 
    

   
var userAgent= req.useragent;


 
const deviceDetector = new DeviceDetector();
const device = deviceDetector.parse(req.headers['user-agent']);
 




var os = device.os.name;

    const {
        campaign,
        user,
        osName,
        mobileModel,
        mobileVendor
    } = req.body;

        var campaigndata=await campaignModel.findById(campaign);
        var users=await User.findById(user);

        


        // res.json(req.body); return;

        if(campaigndata.status==1){

            
   
                var fDate,lDate,cDate;
               var today = Moment(Date.now()).format('MM/DD/YYYY');
            
               var  from =   Moment(campaigndata.campaigns_from_date).format('MM/DD/YYYY');
               var  to =   Moment(campaigndata.campaigns_till_date).format('MM/DD/YYYY');
            
            
                
                fDate = Date.parse(from);
                lDate = Date.parse(to);
                cDate = Date.parse(today);
            
                if((cDate <= lDate && cDate >= fDate)) 
                {
                    let msg = new LinkTracking({
                        ipAddress: ipAddress,
                        campaign: campaigndata._id,
                        user: users._id,
                        osName: os,
                        mobileModel: mobileModel,
                        mobileVendor: mobileVendor,
                        AppName:campaigndata.title,
              
                       
                      })
                      var added=await  msg.save();

                }
                
              
            
        }
       
        res.json({'status':true,'data':campaigndata});

  
 }; 

 module.exports.DownloadCheck = async function(req, res) { 
     
   
 
 

    const ogipAddress = requestIp.getClientIp(req); 
    
    let buff = new Buffer(ogipAddress);
    let base64data = buff.toString('base64');


    const ipAddress = base64data; 

    console.log(ipAddress);

    // const ipAddress = bcrypt.hashSync(ogipAddress, 10);
    var userAgent= req.useragent;


 
    const deviceDetector = new DeviceDetector();
    const device = deviceDetector.parse(req.headers['user-agent']);
     
    console.log(device);
    
    
    
    
    var os = device.os.name;
  
    const {
        DeviceId,
        BundleId,
        BuildVersion,
        AppName,
        ModelNumber,
        iosVersion
    } = req.body;

    

   var check = await LinkTracking.findOne({ipAddress: ipAddress,AppName: AppName,osName:os }).populate('campaign');
  
    

   if(check){
   
    console.log(today);
    var fDate,lDate,cDate;
   var today = Moment(Date.now()).format('MM/DD/YYYY');

   var  from =   Moment(check.campaign.campaigns_from_date).format('MM/DD/YYYY');
   var  to =   Moment(check.campaign.campaigns_till_date).format('MM/DD/YYYY');


    
    fDate = Date.parse(from);
    lDate = Date.parse(to);
    cDate = Date.parse(today);

    if((cDate <= lDate && cDate >= fDate)) 
    {
     var  count = await DownloadTracking.find({_id:check.campaign}).count();

       if(count >= check.campaign.max_availble_downloads){
        res.json({'status':false,'msg':'Campaign reach at max download limit '}); return;
       }else{
        allreadyDownload=await DownloadTracking.findOne({ipAddress: ipAddress,AppName: AppName,DeviceId:DeviceId,osName:os });

        if(allreadyDownload){
            res.json({'status':false,'msg':'App Download  already count by this user '}); return;
        }else{
    
            let msg = new DownloadTracking({
                ipAddress: ipAddress,
                campaign: check.campaign,
                user: check.user,
                osName: os,
                mobileModel: check.mobileModel,
                mobileVendor: check.mobileVendor,
                AppName:AppName,
                DeviceId: DeviceId,
                BundleId:BundleId,
                BuildVersion:BuildVersion,
                sharify_get_download:check.campaign.sharify_get_download,
                user_get_download:check.campaign.user_per_download
              })
      
              var added=await  msg.save();
      
            if(added){

                res.json({'status':true,'data':msg}); ;
            }else{
                res.json({'status':false,'data':[]});
            }
      
      
           
    
        }
       }

       
    }else{
        res.json({'status':false,'msg':'Campiagn is expired'}); return;

    }
  

   


        




   }
   console.log(req.body);

   console.log(AppName);


   res.json({'status':false,'msg':"Not logged",'data':req.body});

  
 }; 

 module.exports.deactiveCampign=async function(req,res) {
   
    try {
        // const decoded = jwt.verify(token, SECERT_KEY);

        // req.user = decoded;

        campaignModel.findById(req.body.campid).then(campign =>
        {
              
                if(!campign){
                    return res.json({msg : 'Campigain does not exist', success : false})
                }

                if(campign)
                {
                    
                    campign.status = 3; // status 3 = achrived
                    campign.save().then((saveduser) => {
                        if(!saveduser){
                            res.json(
                                {
                                    success: false,
                                    msg: 'Try Again !'
                                }
                            )
                        }
                        res.json(
                            {
                                success: true,
                                msg: 'Campiagn archived successfully'

                            }
                        )
                    });

                }

                
            })
            .catch(err => {
                return res.json({'msg' : 'campiagn not  found', success : false})
            })
    }

    catch (e) {
        return res.json({msg : 'Token not valid', success : false})
    }
}

module.exports.updateStatusCampign=async function(req,res) {
   
    try {
        

        campaignModel.findById(req.body.campid).then(campign =>
        {
              
                if(!campign){
                    return res.json({msg : 'Campigain does not exist', success : false})
                }

                if(campign)
                {
                    var m = '';
                    if(campign.status==1){
                        m= 'Campiagn paused successfully';
                        campign.status = 2;
                    }else{
                        campign.status = 1;
                        m= 'Campiagn played successfully';
                    }
                    // status 3 = achrived
                    campign.save().then((saveduser) => {
                        if(!saveduser){
                            res.json(
                                {
                                    success: false,
                                    msg: 'Try Again !'
                                }
                            )
                        }
                        res.json(
                            {
                                success: true,
                                msg: m

                            }
                        )
                    });

                }

                
            })
            .catch(err => {
                return res.json({'msg' : 'campiagn not  found', success : false})
            })
    }

    catch (e) {
        return res.json({msg : 'Token not valid', success : false})
    }
}


module.exports.addBankDetail = async function(req, res) {
    //console.log(req.body);return false;
      const bankDetails = {
            company: req.body.company,
            company_address: req.body.company_address,
            postal_code: req.body.postal_code,
            city: req.body.city,
            country: req.body.country,
            account_holder: req.body.account_holder,
            iban: req.body.iban,
            bic: req.body.bic,
            user: req.body.userid,
            additional_optional: req.body.additional_optional,
            tax_number: req.body.tax_number,
            tax_information_person:req.body.tax_information_person
          };


          console.log(bankDetails);

  
          const filter = { user: req.body.userid };    
          let updated = await bankDetailModel.findOneAndUpdate(filter, bankDetails, {
              new: true,
              upsert: true,
              setDefaultsOnInsert: true
            }); 
          if(updated){
              console.log(updated);
              res.json({'status':true,'data':req.body});
          }else{
              res.json({'status':false,'data':[]});    
          }
     
  }
  
  module.exports.sendPayoutRequest = async function(req, res) {

    var userbank = await bankDetailModel.findOne({ user: req.body.userid });
    var users = await User.findById(req.body.userid);

    if(userbank)
    {
        var last30data  =  await DownloadTracking.find({
            user:users._id,
            "createdOn": 
            {
                $lte: new Date((new Date().getTime() - (30 * 24 * 60 * 60 * 1000)))
            }
        });
        if(last30data.length){
            var last = last30data.length;
            var firstdate = last30data[0].createdOn;

           var ldate = await payoutRequest.findOne({user:users._id}).sort({"createdOn": -1});

           if(ldate){
               firstdate = ldate.createdOn;
           }
             var lastdate = last30data[last-1].createdOn;
        }

        var totalPayoutAmount = 0;

        var currenttotal30 = 0;

        var total =0;
        var lasttotal30 = 0;


        

    
     

        var download =  await DownloadTracking.aggregate([
            {
                $match:{user:users._id}
            }, 
            {
            $group: {
                    _id: null, 
                    userget: {$sum: '$user_get_download'},
                    Reavnue: {$sum: '$sharify_get_download'}
                }
            }
            ]);
           




            if(typeof download  !== 'undefined' && download.length > 0){
                
                total = download[0].userget;

              
       
                
            }


        var totalPayoutRequest  =  await payoutRequest.aggregate([
            {
                $match:{
                    user:users._id,  
                }
            }, 
            {
            $group: {
                    _id: null, 
                    amount: {$sum: '$amount'},
                }
            }
            ]);

            if(typeof totalPayoutRequest  !== 'undefined' && totalPayoutRequest.length > 0){
                totalPayoutAmount = totalPayoutRequest[0].amount;

                console.log(totalPayoutAmount);

                currenttotal30 = parseFloat(total) - parseFloat(totalPayoutAmount);

            }else{
                currenttotal30 = parseFloat(total);
            }
        
      



  

            var last30  =  await DownloadTracking.aggregate([
                {
                    $match:{
                        user:users._id,
                        "createdOn": 
                        {
                            $lte: new Date((new Date().getTime() - (30 * 24 * 60 * 60 * 1000)))
                        }
                        
                    }
                }, 
                {
                $group: {
                        _id: null, 
                        userget: {$sum: '$user_get_download'},
                    }
                }
                ]);

              

         
            

        if(typeof last30  !== 'undefined' && last30.length > 0)
        {
            lasttotal30 = last30[0].userget;

            lasttotal30 = parseFloat(lasttotal30) - parseFloat(totalPayoutAmount);
                
        }

       

           if(lasttotal30 >= 50){

            var userbank = await bankDetailModel.findOne({user:users._id});
            const payoutData = new payoutRequest({
              
                user: req.body.userid,
                amount: lasttotal30,
                withdrawStatus:0,
                userbank:userbank,
                start_date:firstdate,
                last_date:lastdate

              });



          
              payoutData.save().then(doc => {
                res.json({'status':true,'data':doc});

              }).catch(err => {
                  console.log(err);
                  res.json({'status':false,'data':[]});
              
              });


            

           }else{
        res.json({'status':false,'data':[],'msg':"For send payout Request last 30  credit should be over 50 Euro"});

           }
    
    
    
           
    }else{
        res.json({'status':false,'data':[],'msg':"Before Generate payout request please save your bank details"});

    }

    
    }
  
  
  
  module.exports.getBankDetails = async function(req, res) {
      try {
          console.log("req.params.id");
          console.log(req.params.id);
          if(req.params.id){        
              bankDetailModel.findOne({ user: req.params.id })
              .then(bankDetailModel =>
              {
                      if(!bankDetailModel){
                          return res.json({msg : 'bank Detail Does not exist', success : false})
                      }
  
                      if(bankDetailModel)
                      {                    
                          res.json(
                              {
                                  success: true,
                                  msg: 'Bank Details',
                                  data: bankDetailModel
  
                              }
                          );
                      }
                  })
                  .catch(err => {
                      return res.json({'msg' : 'Bank Detail not found', success : false})
                  })
          }else{
                  res.json({'status':false,'message':'No Data found'});
          }
      }
      catch (e) {
          return res.json({msg : 'Token not valid', success : false})
      }
  }; 
  
  
  
  module.exports.getPayoutRequests = async function(req , res){
      if(req.params.id){    
          const payoutRequests = await payoutRequest.find({ user: req.params.id });
          if (payoutRequests) {
              
              //console.log(arr);return false;
              res.json({'status':true,'success':true,'data':payoutRequests});
          } else {
              res.json({'status':false,'success':false,'data':[]});
          }
      }else{
          res.json({'status':false,'success':false,'data':[]});
      }
       
  }
  
  module.exports.getPdf = async function(req , res){
      if(req.params.id){    
          const payoutRequests = await payoutRequest.find({ user: req.params.id });
          if (payoutRequests) {
              
              //console.log(arr);return false;
              res.json({'status':true,'success':true,'data':payoutRequests});
          } else {
              res.json({'status':false,'success':false,'data':[]});
          }
      }else{
          res.json({'status':false,'success':false,'data':[]});
      }
       
  }

   
  module.exports.userRevanue = async function(req , res){
    if(req.params.id){    
        var  users = await User.findById(req.params.id);

        var conversion = 0 ;  

        var avarage = 0;

        var totalPayoutAmount = 0;

        var currenttotal30 = 0;

        var total =0;
        var lasttotal30 = 0;

        var monthIncome = 0;


        var lastMonth  =  await DownloadTracking.aggregate([
            {
                $match:{
                    user:users._id,
                    "createdOn": 
                    {
                        $gte: new Date((new Date().getTime() - (30 * 24 * 60 * 60 * 1000)))
                    }
                    
                }
            }, 
            {
            $group: {
                    _id: null, 
                    userget: {$sum: '$user_get_download'},
                }
            }
            ]);


        
            if(typeof lastMonth  !== 'undefined' && lastMonth.length > 0){
                
                monthIncome = lastMonth[0].userget;
                
            }    


        

    
        var  linkClickCount = await LinkTracking.find({ user: req.params.id }).count();
        var  linkDownloadCount = await DownloadTracking.find({ user: req.params.id }).count();


        var download =  await DownloadTracking.aggregate([
            {
                $match:{user:users._id}
            }, 
            {
            $group: {
                    _id: null, 
                    userget: {$sum: '$user_get_download'},
                    Reavnue: {$sum: '$sharify_get_download'}
                }
            }
            ]);
           




            if(typeof download  !== 'undefined' && download.length > 0){
                
                total = download[0].userget;

                if(linkDownloadCount>0){
                    avarage =(parseInt(total)/parseInt(linkDownloadCount));

                    avarage = (avarage).toFixed(1);
                }
                
       
                
            }


        var totalPayoutRequest  =  await payoutRequest.aggregate([
            {
                $match:{
                    user:users._id,  
                }
            }, 
            {
            $group: {
                    _id: null, 
                    amount: {$sum: '$amount'},
                }
            }
            ]);

            if(typeof totalPayoutRequest  !== 'undefined' && totalPayoutRequest.length > 0){
                totalPayoutAmount = totalPayoutRequest[0].amount;

                console.log(totalPayoutAmount);

                currenttotal30 = parseFloat(total) - parseFloat(totalPayoutAmount);

            }else{
                currenttotal30 = parseFloat(total);
            }
        
        if(linkDownloadCount>0){
              conversion = (parseInt(linkDownloadCount)*100)/parseInt(linkClickCount);

        }



  

            var last30  =  await DownloadTracking.aggregate([
                {
                    $match:{
                        user:users._id,
                        "createdOn": 
                        {
                            $lte: new Date((new Date().getTime() - (30 * 24 * 60 * 60 * 1000)))
                        }
                        
                    }
                }, 
                {
                $group: {
                        _id: null, 
                        userget: {$sum: '$user_get_download'},
                    }
                }
                ]);

              

         
            

        if(typeof last30  !== 'undefined' && last30.length > 0)
        {
            lasttotal30 = last30[0].userget;

            lasttotal30 = parseFloat(lasttotal30) - parseFloat(totalPayoutAmount);
                
        }

      

        const data ={
            linkClickCount,
            linkDownloadCount,
            conversion,
            total,
            avarage,
            currenttotal30,
            lasttotal30,
            monthIncome
           
            

        }


        res.json({'status':true,'data':data});
    }else{
        res.json({'status':false,'success':false,'data':[]});
    }
     
}

module.exports.payoutRequestById = async function(req , res){
    if(req.params.id){    
        const payoutRequests = await payoutRequest.findById(req.params.id);
        console.log(payoutRequests);
        if (payoutRequests) {

            const userBank = await bankDetailModel.findOne({user:payoutRequests.user}).populate('user');


           
            
            //console.log(arr);return false;
            res.json({'status':true,'success':true,'data':payoutRequests,'userbank':userBank});
        } else {
            res.json({'status':false,'success':false,'data':[]});
        }
    }else{
        res.json({'status':false,'success':false,'data':[]});
    }
     
}







module.exports.userLastestActivity = async function(req , res){
    if(req.params.id){    
        
        var  Download = await DownloadTracking.find({ user: req.params.id }).limit(5).sort({$natural:-1});

        if(Download)
        {
            res.json({'status':true,'data':Download});
             
        }else{
            res.json({'status':false,'msg':'No Download Found!.'});

        }        
    }else{
        res.json({'status':false,'success':false,'data':[]});
    }
     
}

module.exports.AdminDashboardGraph = async function(req , res){
  
      var filter  = req.params.filter;
        var  campaigns = await campaignModel.find({status:1});


        if(campaigns)
        {
            



            var result2 =  [] ;
            var profit = 0;
            var userget =0;
            var   totalReavnue= 0;


            var  linkClickCount = await LinkTracking.find().count();
            var  linkDownloadCount = await DownloadTracking.find().count();
            var overallsum =  await DownloadTracking.aggregate([ 
               {
               $group: {
                       _id: null, 
                       userget: {$sum: '$user_get_download'},
                       sharifyget: {$sum: '$sharify_get_download'}
                   }
               }
               ]);

               console.log(overallsum);

               if(typeof overallsum !== 'undefined' && overallsum.length > 0){
                   userget = overallsum[0].userget;
                   totalReavnue = overallsum[0].sharifyget;
                   profit = parseFloat(totalReavnue)-parseFloat(userget);
               }

               

               const calData ={
                   linkClickCount,
                   linkDownloadCount,
                   totalReavnue,
                   userget,
                   profit
               } 


            if(filter=='Clicks')
            {
                
                var overallDownload =  await  LinkTracking.aggregate([ 
                    {
                    $group: {
                            _id: {$substr: ['$createdOn', 5, 2]}, 
                            clicks: {$sum: 1}
    
                        }
                    }
                    ]);

                    if(overallDownload){
                        var  data=[null,0,0,0,0,0,0,0,0,0,0,0,0];
    
                        for(var j= 0; j<overallDownload.length;j++){
                            if(overallDownload[j]._id==01 || overallDownload[j]._id==02 || overallDownload[j]._id==03 || overallDownload[j]._id==04 || overallDownload[j]._id==05 || overallDownload[j]._id==06 || overallDownload[j]._id==07 || overallDownload[j]._id==08 || overallDownload[j]._id==09){
                                var itemId = overallDownload[j]._id.substring(1, overallDownload[j]._id.length);
                               
                           }else{
                               var itemId = overallDownload[j]._id;
                           }
                           
                            data[itemId] = overallDownload[j].clicks;
    
                           
    
                        }
                        data.shift();
    
                        var innerObj2 = {};
                        innerObj2['name'] = 'overall';
                        innerObj2['data'] = data;
                        result2.push(innerObj2);
                    }


                    for (var i=0; i<campaigns.length; i++){

                        var fDate,lDate,cDate;
                        var today = Moment(Date.now()).format('MM/DD/YYYY');
                     
                        var  from =   Moment(campaigns[i].campaigns_from_date).format('MM/DD/YYYY');
                        var  to =   Moment(campaigns[i].campaigns_till_date).format('MM/DD/YYYY');
                     
                     
                         
                         fDate = Date.parse(from);
                         lDate = Date.parse(to);
                         cDate = Date.parse(today);
                     
                         if((cDate <= lDate && cDate >= fDate)) 
                         {

                        var  data=[null,0,0,0,0,0,0,0,0,0,0,0,0];
        
        
                      var download =  await LinkTracking.aggregate([
                        {
                            $match:{campaign:campaigns[i]._id}
                        }, 
                        {
                        $group: {
                                _id: {$substr: ['$createdOn', 5, 2]}, 
                                clicks: {$sum: 1}
                            }
                        }
                        ]);
                        if(download){
        
                            for(var k= 0; k<download.length;k++){
                                if(download[k]._id==01 || download[k]._id==02 || download[k]._id==03 || download[k]._id==04 || download[k]._id==05 || download[k]._id==06 || download[k]._id==07 || download[k]._id==08 || download[k]._id==09){
                                     var itemId = download[k]._id.substring(1, download[k]._id.length);
                                    
                                }
                                else{
                                    var itemId = download[k]._id;
                                }
        
                             
                                        data[itemId] = download[k].clicks ;
               
                                      
                            }
                            data.shift();
        
                            var innerObj = {};
                            innerObj['name'] = (campaigns[i].title).substring(0, 20);
                            innerObj['data'] = data;
                            result2.push(innerObj);
                        }
                        
                    }
                        
        
                        //  result2[campaigns[i].title] = download;
        
                       
                     }  



            }else{

                var overallDownload =  await DownloadTracking.aggregate([ 
                    {
                    $group: {
                            _id: {$substr: ['$createdOn', 5, 2]}, 
                            userget: {$sum: '$user_get_download'},
                            Reavnue: {$sum: '$sharify_get_download'},
                            download: {$sum: 1}
    
                        }
                    }
                    ]);
    
                    if(overallDownload){
                        var  data=[null,0,0,0,0,0,0,0,0,0,0,0,0];
    
                        for(var j= 0; j<overallDownload.length;j++){
                            if(overallDownload[j]._id==01 || overallDownload[j]._id==02 || overallDownload[j]._id==03 || overallDownload[j]._id==04 || overallDownload[j]._id==05 || overallDownload[j]._id==06 || overallDownload[j]._id==07 || overallDownload[j]._id==08 || overallDownload[j]._id==09){
                                var itemId = overallDownload[j]._id.substring(1, overallDownload[j]._id.length);
                               
                           }else{
                               var itemId = overallDownload[j]._id;
                           }
                           if(filter=='Profit'){
                         var    profit = parseFloat(overallDownload[j].Reavnue)-parseFloat(overallDownload[j].userget);
                            data[itemId] = profit;
    
                           }else if(filter=='Downloads'){
                            data[itemId] = overallDownload[j].download ;
    
                           }
                           else{
                            data[itemId] = overallDownload[j].Reavnue ;
    
                           }
    
                        }
                        data.shift();
    
                        var innerObj2 = {};
                        innerObj2['name'] = 'overall';
                        innerObj2['data'] = data;
                        result2.push(innerObj2);
                    }

                    for (var i=0; i<campaigns.length; i++){


                        var fDate,lDate,cDate;
                        var today = Moment(Date.now()).format('MM/DD/YYYY');
                     
                        var  from =   Moment(campaigns[i].campaigns_from_date).format('MM/DD/YYYY');
                        var  to =   Moment(campaigns[i].campaigns_till_date).format('MM/DD/YYYY');
                     
                     
                         
                         fDate = Date.parse(from);
                         lDate = Date.parse(to);
                         cDate = Date.parse(today);
                     
                         if((cDate <= lDate && cDate >= fDate)) 
                         {
                            var  data=[null,0,0,0,0,0,0,0,0,0,0,0,0];
        
        
                            var download =  await DownloadTracking.aggregate([
                              {
                                  $match:{campaign:campaigns[i]._id}
                              }, 
                              {
                              $group: {
                                      _id: {$substr: ['$createdOn', 5, 2]}, 
                                      userget: {$sum: '$user_get_download'},
                                      Reavnue: {$sum: '$sharify_get_download'},
                                      downloads: {$sum: 1}
                                  }
                              }
                              ]);
                              if(download){
              
                                  for(var k= 0; k<download.length;k++){
                                      if(download[k]._id==01 || download[k]._id==02 || download[k]._id==03 || download[k]._id==04 || download[k]._id==05 || download[k]._id==06 || download[k]._id==07 || download[k]._id==08 || download[k]._id==09){
                                           var itemId = download[k]._id.substring(1, download[k]._id.length);
                                          
                                      }
                                      else{
                                          var itemId = download[k]._id;
                                      }
              
                                      if(filter=='Profit'){
                                          var    profit = parseFloat(download[k].Reavnue )-parseFloat(download[k].userget);
                                             data[itemId] = profit;
                     
                                            }else if(filter=='Downloads')
                                            {
                                                data[itemId] = download[k].downloads ;
                        
                                            }else{
                                              data[itemId] = download[k].Reavnue ;
                     
                                            }
                                  }
                                  data.shift();
              
                                  var innerObj = {};
                                  innerObj['name'] = (campaigns[i].title).substring(0, 20);
                                  innerObj['data'] = data;
                                  result2.push(innerObj);
                         }
                        

                       
                        }
        
                        
        
                        //  result2[campaigns[i].title] = download;
        
                       
                     }  


                
            }

         

            

           
                // result2['overall'] = overallDownload;

            

            
             



             
             res.json({'status':true,'result':result2,'calData':calData,'campList':campaigns});
         

           

             
             
        }else{
            res.json({'status':false,'msg':'No Campiagn Found!.'});

        }        
   
     
}


module.exports.campiagnGraph = async function(req , res){
  
    var campid = req.params.campid;

        
    var  campaigns = await campaignModel.findById(campid);


    if(campaigns)
    {
        var result2 =  [] ;
        

     

         var  linkClickCount = await LinkTracking.find({'campaign':campid}).count();
         var  linkDownloadCount = await DownloadTracking.find({'campaign':campid}).count();
        

         
      
            // result2['overall'] = overallDownload;

            const calData = {
                linkClickCount,
                linkDownloadCount
            }

      

            var  data=[null,0,0,0,0,0,0,0,0,0,0,0,0];


          var download =  await DownloadTracking.aggregate([
            {
                $match:{'campaign':campaigns._id}
            }, 
            {
            $group: {
                    _id: {$substr: ['$createdOn', 5, 2]}, 
                    count:{$sum:1},
                }
            }
            ]);
            if(download){

                for(var k= 0; k<download.length;k++){
                    if(download[k]._id==01 || download[k]._id==02 || download[k]._id==03 || download[k]._id==04 || download[k]._id==05 || download[k]._id==06 || download[k]._id==07 || download[k]._id==08 || download[k]._id==09){
                         var itemId = download[k]._id.substring(1, download[k]._id.length);
                        
                    }else{
                        var itemId = download[k]._id;
                    }
                    data[itemId] = download[k].count ;
                }
                data.shift();

                var innerObj = {};
                innerObj['name'] = 'download';
                innerObj['data'] = data;
                result2.push(innerObj);
            }


            var click =  await LinkTracking.aggregate([
                {
                    $match:{'campaign':campaigns._id}
                }, 
                {
                $group: {
                        _id: {$substr: ['$createdOn', 5, 2]}, 
                        count2:{$sum:1},
                    }
                }
                ]);
                if(click){
                    var  data=[null,0,0,0,0,0,0,0,0,0,0,0,0];
    
                    for(var k= 0; k<click.length;k++){
                        if(click[k]._id==01 || click[k]._id==02 || click[k]._id==03 || click[k]._id==04 || click[k]._id==05 || click[k]._id==06 || click[k]._id==07 || click[k]._id==08 || click[k]._id==09){
                             var itemId = click[k]._id.substring(1, click[k]._id.length);
                            
                        }else{
                            var itemId = click[k]._id;
                        }
                        data[itemId] = click[k].count2 ;
                    }
                    data.shift();
    
                    var innerObj = {};
                    innerObj['name'] = 'click';
                    innerObj['data'] = data;
                    result2.push(innerObj);
                }



           
                res.json({'status':true,'result':result2,'calData':calData,'campList':campaigns});

            
               
     

       

         
         
    }else{
        res.json({'status':false,'msg':'No Campiagn Found!.'});

    }        

 
}
// all payment  request for admin

module.exports.getPayoutRequestsAdmin = async function(req , res){
     
        const payoutRequests = await payoutRequest.find();
      
        if (payoutRequests) {
          

             var arr = [];

            for (var i=0; i<payoutRequests.length; i++){

                
                
             const userBank = await bankDetailModel.findOne({user:payoutRequests[i].user}).populate('user');

                         payoutRequests[i].userbank.user=userBank.user;
           
                 
               }  

               
            
            
            res.json({'status':true,'success':true,'data':payoutRequests});
        } else {
            res.json({'status':false,'success':false,'data':[]});
        }
   
     
}

// change status credit note 


module.exports.updateStatusPayout=async function(req,res) {
   
    try {
        

        payoutRequest.findById(req.body.reqid).then(campign =>
        {
              
                if(!campign){
                    return res.json({msg : 'payout  does not exist', success : false})
                }

                if(campign)
                {
                    var m = '';
                    if(campign.withdrawStatus==0){
                        m= 'Status successfully Paid';
                        campign.withdrawStatus = 1;
                    }else{
                        campign.withdrawStatus = 0;
                        m= 'Status successfully unpaid';
                    }
                    // status 3 = achrived
                    campign.save().then((saveduser) => {
                        if(!saveduser){
                            res.json(
                                {
                                    success: false,
                                    msg: 'Try Again !'
                                }
                            )
                        }
                        res.json(
                            {
                                success: true,
                                msg: m

                            }
                        )
                    });

                }

                
            })
            .catch(err => {
                return res.json({'msg' : 'Payout Request  not  found', success : false})
            })
    }

    catch (e) {
        return res.json({msg : 'Token not valid', success : false})
    }
}

// admin revnge

module.exports.AdminRevanue = async function(req , res){

        var  linkClickCount = await LinkTracking.find().count();
        var  linkDownloadCount = await DownloadTracking.find().count();
        var  conversion = (parseInt(linkDownloadCount)*100)/parseInt(linkClickCount);
        var  Download = await DownloadTracking.find().populate('campaign');


        if(Download)
        {
            var total = 0;
            for (var i=0; i<Download.length; i++){

               total =  total + parseInt(Download[i].campaign.user_per_download);

              
            }

            var avarage =(parseInt(total)/parseInt(linkDownloadCount));
            avarage = (avarage).toFixed(1);

             
        }


      

        const data ={
            linkClickCount,
            linkDownloadCount,
            conversion,
            total,
            avarage

        }

        res.json({'status':true,'data':data});
    
     
}


module.exports.distibruteLink = async function(req, res) {
    //console.log(req.body);return false;
      const dis = {
            user: req.body.userid,
            campaign: req.body.campid,
            link: req.body.link
          };



  
          const filter = { user: req.body.userid,campaign:req.body.campid };    
          let updated = await dislink.findOneAndUpdate(filter, dis, {
              new: true,
              upsert: true,
              setDefaultsOnInsert: true
            }); 
          if(updated){
              console.log(updated);
              res.json({'status':true,'success':true,'data':req.body});
          }else{
              res.json({'status':false,'success':false,'data':[]});    
          }
     
  }

module.exports.sendaddcampignnotification = async function(req, res) {
    //console.log(req.body);return false;

     
    var users = await User.find({status:1,role:2});


                    if(users){
                        
                        for (var i=0; i<users.length; i++)
                        {
                           await sendmails("New campaign listed",users[i].email,"<h1>New campaign added click here to earn more </br><a href='" + WEB_URL + "user/Campaings/'>Click here</a></p>");
                        }
        
                    }

                    res.json({'status':true,'success':true});
 
  }

// send notification on new campaign
  module.exports.sendNotifactionArchived = async function(req, res) {
    //console.log(req.body);return false;
   var title = req.params.title;
     
    var users = await User.find({status:1,role:2});


                    if(users){
                        
                        for (var i=0; i<users.length; i++)
                        {
                           await sendmails("Campaign archived",users[i].email,"Campaign "+ title +" has been archived.Your link still works, but you no longer receive payouts for your downloads.");
                        }
        
                    }

                    res.json({'status':true,'success':true});
 
  }


  

  //  send notifcation on credit note 

  module.exports.sendNotificationCredit = async function(req, res) {

    var id = req.params.id;

    var pdf = require("pdf-creator-node");
 var fs = require('fs');
 
  var request = await payoutRequest.findById(id);

  var users = await User.findById(request.user);
 
 
                     if(request){
                         
                         var html = fs.readFileSync('creditNoteTemplete.html', 'utf8');
 
 var options = {
    format: "A4",
    orientation: "portrait",
    border: "1mm",
    
 };
 var isTax = false;
 var tax = 0;
 var finalamt = 0;
 if(request.userbank.tax_information_person !== 1){
  isTax = true;
  var  taxpercantage = 19/100;
 
         tax_calculate = taxpercantage*(request.amount);
         tax = (tax_calculate.toLocaleString('de-DE'));
 
      var amt = tax_calculate+request.amount;
      finalamt  = (amt.toLocaleString('de-DE'));
    
      
 }else{
     finalamt = request.amount;
 }
 
 var document = {
     html: html,
     data: {
         url2:WEB_URL,
         amount:request.amount,
         userbank:request.userbank,
         createdOn:Moment(request.createdOn).format('DD.MM.YYYY'),
         startDate:Moment(request.start_date).format('DD.MM.YYYY'),
         endDate:Moment(request.last_date).format('DD.MM.YYYY'),
         tax:tax,
         finalAmount:finalamt,
         isTax:isTax,
         id:request._id
     },
     path: "./uploads/output.pdf"
 };
 
 

 
 pdf.create(document, options)
     .then(
        
        async  function  ()  {
            var to = users.email;
            var subject = 'Credit Note ';
            var msg = 'Credit note has been created successfully.';
                   let transporter = nodemailer.createTransport({
                       host: smtpServer,
                       port: smtpPort,
                       secure: false,
                       auth: {
                           user: smtpUser,
                           pass: smtpPass,
                       },
                   });
               
               
                   var currentTime = new Date();
               
                   // send mail with defined transport object
                   let info = await transporter.sendMail({
                       from: '"Sharify👻" <info@sharify.com>', // sender address
                       to: to, // list of receivers
                       subject: subject, // Subject line
                       html: msg,    // html body,
                       attachments : [
                           { // use URL as an attachment
                             filename: 'output.pdf',
                             path: './uploads/output.pdf'
                           }
                         ]
                   });
                   if(info){
                       res.json({'status':true,'success':true,'result':''});
           
                   }
        },
        function (err) {
            resolve(alert(err.message));
        }

       

     );
    
                        
         
    }else{
        res.json({'status':false,'success':false});
    }
  

}
 
module.exports.sendmails = async function(subject,to,msg) {
    let transporter = nodemailer.createTransport({
        host: smtpServer,
        port: smtpPort,
        secure: false,
        auth: {
            user: smtpUser,
            pass: smtpPass,
        },
    });


    var currentTime = new Date();

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"Sharify👻" <info@sharify.com>', // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        html: msg // html body
    });

    if (info.messageId) {

        return true;

    }
    return false;

}

module.exports.generateCreditNote = async function(req, res) {
    //console.log(req.body);return false;
   var id = req.params.id;

   var pdf = require("pdf-creator-node");
var fs = require('fs');

 var request = await payoutRequest.findById(id);


                    if(request){
                        
                        var html = fs.readFileSync('creditNoteTemplete.html', 'utf8');

var options = {
    format: "A4",
    orientation: "portrait",
    border: "1mm",
   
};
var isTax = false;
var tax = 0;
var finalamt = 0;
if(request.userbank.tax_information_person !== 1){
 isTax = true;
 var  taxpercantage = 19/100;

        tax_calculate = taxpercantage*(request.amount);
        tax = (tax_calculate.toLocaleString('de-DE'));

     var amt = tax_calculate+request.amount;
     finalamt  = (amt.toLocaleString('de-DE'));
   
     
}else{
    finalamt = request.amount;
}

var document = {
    html: html,
    data: {
        url2:WEB_URL,
        amount:request.amount,
        userbank:request.userbank,
        createdOn:Moment(request.createdOn).format('DD.MM.YYYY'),
        startDate:Moment(request.start_date).format('DD.MM.YYYY'),
        endDate:Moment(request.last_date).format('DD.MM.YYYY'),
        tax:tax,
        finalAmount:finalamt,
        isTax:isTax,
        id:request._id
    },
    path: "./uploads/output.pdf"
};


var users = [
    {
        name:"Shyam",
        age:"26"
    },
    {
        name:"Navjot",
        age:"26"
    },
    {
        name:"Vitthal",
        age:"26"
    }
]

pdf.create(document, options)
    .then(resr => {
        res.json({'status':true,'success':true,'result':resr});
    })
    .catch(error => {

    });
                       
        
                    }else{
                        res.json({'status':false,'success':false});
                    }

        



     
               
 
  }

  