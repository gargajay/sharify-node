const loginController = require("../controllers/auth.controller.js");
const userController = require("../controllers/user.controller.js"); 
const router = require("express").Router();
const db = require("../models");
const bodyParser = require("body-parser");

var cors = require("cors");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const session = require("express-session");
var cookieParser = require("cookie-parser");
var flash = require("express-flash"); 
const auth = require('../helpers/authenticate');
const { util } = require("config");


 

router.use(cookieParser());  


router.get("/profile", loginController.profile);
router.post("/login", loginController.login); 
router.post("/find/:email", userController.findEmail); 
router.post("/register", userController.register); 
router.get("/sendmail", userController.sendmail); 
router.post("/forgot-password", userController.forgotpassword); 
router.post("/reset-password", userController.resetpassword); 
router.post("/verify-account", userController.verifyaccount); 
router.post("/update-profile", userController.updateprofile);  
router.post("/addCampaign", auth,userController.addCampaigns);  
router.get("/getCampaigns",auth, userController.getCampaigns); 
router.get("/getuserCampaigns",auth, userController.getuserCampaigns); 
router.get("/getActivewCampaigns",auth, userController.getActiveCampaigns);  
router.get("/getArchivedCampaigns",auth, userController.getArchivedCampaigns);  

router.get("/getUsers",auth, userController.getUsers);  
router.post("/updateUserStatus",auth, userController.updateUserStatus);  
router.post("/updateStatusCampign",auth, userController.updateStatusCampign);  
router.post("/updateStatusPayout",auth, userController.updateStatusPayout);  




router.get("/getMedia/:campid",auth, userController.getMedia);
router.get("/sendNotifactionArchived/:title",auth, userController.sendNotifactionArchived);



router.get("/sendaddcampignnotification",auth, userController.sendaddcampignnotification);





router.get("/campaignGraphById/:campid",auth, userController.campiagnGraph);






router.get("/getAllMedia",auth, userController.getAllMedia);  
router.get("/getMediaUser/:campid/:mediatype",auth, userController.getMediaUser);  
router.post("/delete-account", userController.deleteaccount);




router.post("/mediaStatusChange",auth, userController.mediaStatusChange);  
router.post("/deleteMedia",auth, userController.deleteMedia);
router.post("/deleteCompaign", userController.deleteCompaign);  

router.post("/feeds", auth,userController.addFeeds);  
router.post("/stories",auth, userController.addStory);  
router.post("/profile",auth, userController.addProfile);  
router.post("/banner",auth, userController.addBanner);  

router.post("/edit_campaign",auth, userController.edit_campaign);  
router.get("/getCampaignByid/:id", userController.getCampaignByid); 
router.post("/updateUpload/:name/:camid", userController.updateUpload); 

router.post("/deleteUser", userController.deleteUser); 
router.get("/addAdmin", userController.addAdmin); 
router.get('/uploads/:imageName', userController.sendImage);
router.post("/linkClicking", userController.linkClicking); 
router.post("/disLink", userController.distibruteLink); 



router.post("/download-check", userController.DownloadCheck); 
router.post("/deactive-Campign", userController.deactiveCampign); 

router.post("/add-bank-detail", auth, userController.addBankDetail);
router.get("/getBankDetails/:id",  userController.getBankDetails);
router.get("/generateCreditNote/:id",  userController.generateCreditNote);
router.get("/sendNotificationCredit/:id",  userController.sendNotificationCredit);


router.post("/sendPayoutRequest",  userController.sendPayoutRequest);
router.get("/getPayoutRequests/:id",  userController.getPayoutRequests);



router.get("/userRevanue/:id",  userController.userRevanue);
router.get("/AdminRevanue",  userController.AdminRevanue);


router.get("/userLastestActivity/:id",  userController.userLastestActivity);
router.get("/payoutRequestById/:id",  userController.payoutRequestById);


router.get("/AdminDashboardGraph/:filter", auth, userController.AdminDashboardGraph);
router.get("/getPayoutRequestsAdmin", auth, userController.getPayoutRequestsAdmin);










 





 

module.exports = router;
