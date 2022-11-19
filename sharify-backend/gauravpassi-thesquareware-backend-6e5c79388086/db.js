 
 
 const mongoose = require('mongoose');
 const assert = require('assert');
 const config = require('config');

 const db = config.get('db');



 const db_url = db.db_url;

 mongoose.connect(
     db_url,
     {
         useNewUrlParser:true,
         useUnifiedTopology: true,
     },
     function(error,link){
         assert.equal(error,null,'connection fail!');
         console.log("db connected");
         // console.log(link);
     }
 );