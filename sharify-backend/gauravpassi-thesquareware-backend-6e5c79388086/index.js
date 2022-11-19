require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const formData = require("express-form-data");
const os = require("os");
const cors = require("cors");
const User = require('./models/user');



var userController = require('./controllers/user.controller');

const app = express();
var multer = require('multer'); 
const bodyParser = require("body-parser");
const routes = require("./routes/routes.js"); 
let CampaignModel = require('./models/campaign');
let copylink = require('./models/dislink');

const database = require('./db');
const config = require('config');
const appConstants = config.get('appConstants');
const port = appConstants.port;
const helpers = require('./helpers'); 
// const userController = require("./controllers/userController").userController; 
// const routeController = require("./controllers/routeController").routeController; 
const appRouter=express.Router();
const useragent = require('express-useragent');


// // app.use(upload); 
// // app.use(upload.array('profile')); 
// // parse data with connect-multiparty. 

 
app.use(useragent.express());

app.use(bodyParser.json({limit: '50mb'}));

var cron = require('node-cron');
const { copy } = require('./routes/routes.js');
 
cron.schedule('0 1 * * *', async () => {

    // for achrived campigns
 var campaigns =  await CampaignModel.find({ "campaigns_till_date": 
    {
        $lt: new Date()
    },"status":{$ne:3}});


    if(campaigns.length>0){
        for (var i=0; i<campaigns.length; i++){

            var camp= await CampaignModel.findById(campaigns[i]._id);

            if(camp){
                camp.status = 3; 
                camp.save();

                var title = campaigns[i].title
     
    var users = await User.find({status:1,role:2});


                    if(users){
                        
                        for (var i=0; i<users.length; i++)
                        {
                           await  userController.sendmails("Campaign archived",users[i].email,"Campaign "+ title +" has been archived.Your link still works, but you no longer receive payouts for your downloads.");
                        }
        
                    }

            }
           
        }

    }



    // for 5 day before expire


    var campaigns2 =  await CampaignModel.find({ "campaigns_till_date": 
    {
        $gte: new Date((new Date().getTime() + (4 * 24 * 60 * 60 * 1000))),
        $lt: new Date((new Date().getTime() + (5 * 24 * 60 * 60 * 1000))),
        
    },"status":{$ne:3}});

    console.log(campaigns2);

    if(campaigns2.length>0){
        for (var j=0; j<campaigns2.length; j++){


            var title = campaigns2[j].title
     
            var users = await User.find({status:1,role:2});
        
        
                            if(users){


                                
                                for (var i=0; i<users.length; i++)
                                {
                                    var copyl =  await copylink.findOne({user:users[i]._id,campaign:campaigns2[j]._id});

                                    if(copyl){
                                        await  userController.sendmails("Campaign will has been expired after 5 days",users[i].email,"Campaign "+ title +" will has  been expired after 5 days.");

                                    }
                                    
                                }
                
                            }
           
        }

    }





    

    
  console.log('running every minute 1, 2, 4 and 5');
});

app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(morgan('dev'))
app.use(cors());  
app.use("/api", routes);
// app.use('/api',appRouter);
// userController(appRouter);
// routeController(appRouter);
// middelware


 

app.listen(port, () => console.log("Listing http://localhost:"+port));