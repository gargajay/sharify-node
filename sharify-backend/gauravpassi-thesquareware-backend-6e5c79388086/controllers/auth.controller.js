const router = require('express').Router();
 const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const joi = require('@hapi/joi');

const config = require('config');

const { smtpServer, smtpPort, smtpUser, smtpPass } = config.get('smtp');

const { WEB_URL , SECERT_KEY } = config.get('appConstants');

const User = require('./../models/user');
const { create } = require('./../models/user');
 
let campaignModel = require('../models/campaign');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:true}));
module.exports.profile = async function(req, res) {

    let msg = new campaignModel({
      title: 'ADA.LOVELACE@GMAIL.COM',
      banner: 'ADA.LOVELACE@GMAIL.COM',
      profile: 'ADA.LOVELACE@GMAIL.COM',
      description: 'ADA.LOVELACE@GMAIL.COM',
      briefing: 'ADA.LOVELACE@GMAIL.COM',
      expireToken: 'ADA.LOVELACE@GMAIL.COM',
      role: 'ADA.LOVELACE@GMAIL.COM'
    })

    msg.save().then(doc => {
     console.log(doc)
    }).catch(err => {
     console.error(err)
    })
}

module.exports.login = async function(req, res) { 
    
    const { password, token } = req.body; 

    var email = req.body.email.toLowerCase();

    if(token){ 
        try {
            const decoded = jwt.verify(token, SECERT_KEY);

            req.user = decoded;

            User.findById(req.user.id).then(user => {
                    jwt.sign(
                        {id : user.id}, SECERT_KEY, {expiresIn : 360000}, (err, token) => {
                            if(err) throw err;
                            res.json({
                                token,
                                msg : 'Profile authenticated successfully',
                                user : {
                                    id : user.id,
                                    username : user.username,
                                    email : user.email,
                                    token:token,
                                    role:user.role
                                },
                                success : true
                            })

                        }
                    )
                })
                .catch(err => {
                    return res.json({'msg' : 'User not found', success : false})
                })
        }

        catch (e) {
            return res.json({msg : 'Token not valid', success : false})
        }
    } else {

    // Simple validation
    if(!email || !password){
        return res.json({msg : 'Please enter all fields', success : false})
    }

    // Check user
    User.findOne({ email })
        .then(user => {
            if(!user){
                return res.json({msg : 'User Does not exist', success : false})
            }
            console.log(user);
            // Validate password
            bcrypt.compare(password, user.password).then(isMatch => {
                    if(!isMatch){
                        return res.json({msg : 'Invalid Credentials', success : false})
                    }

                    if(user.status==2){
                        return res.json({msg : 'Your account not actve yet.please verify your account!', success : false})
                    }
                    if(user.status==3){
                        return res.json({msg : 'Your account is deleted or deactivated by admin', success : false})
                    }



                    jwt.sign(
                        {id : user.id},
                        SECERT_KEY,
                        { expiresIn : 360000},
                        (err, token) => {
                            if(err) throw err;
                            res.json({
                                success : true,
                                token,
                                msg : 'Login successfully',
                                user : {
                                    id : user.id,
                                    username : user.username,
                                    email : user.email,
                                    token:token,
                                    role:user.role
                                }
                            })
                        }
                    )
                })
        })
    }
};
 