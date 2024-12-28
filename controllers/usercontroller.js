// Created by: Geir Hilmersen
// 5 May 2024 Geir Hilmersen
// 26 December 2024 Geir Hilmersen

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const crypto = require('crypto');

const {
    accessDenied,
    notAuthorized,
    createFeedback,
    resourceNotFound,
    internalServerError
} = require('../handlers/httpFeedbackHandler');

const createuser = async (req,res)=> {
    const {email, givenname, surname, password} = req.body;
    let feedback = createFeedback(404, `${email} could not be created.`);
    if(typeof(email) === 'string' && typeof(password) === 'string' && typeof(surname) && typeof(givenname) === 'string'){
        try {
            const result = await User.create({email, givenname, surname, password});
            if(result) {
                const {_id} = result;
                feedback = createFeedback(200, `${email} was created!`,true, {_id});
            }
        } catch(error) {
            const code = error?.response?.code;
            if(code && typeof(code) === 'number'){
                switch(code) {
                    case 11000:
                        break;
                    default:
                        feedback = createFeedback(409, `${email} could not be created! MongoDB code ${code}`, false, error)
                        break;
                }
            } else {
                feedback = createFeedback(404, error.message, false, error);
            }
        }
    }
    res.status(feedback.statuscode).json(feedback);
}

const upgradeuser = async (req, res)=>{
    const {email, isDowngrade} = req.body;
    let feedback = createFeedback(404, 'Faulty inputdata!');
    try{
        let targetUser = await User.findOne({email});
        const updateduser = await targetUser.changeUserRole(isDowngrade);

        if(updateduser){
            feedback=createFeedback(200, 'Success', true, {email:updateduser.email,role:updateduser.role});
        } else {
            feedback=internalServerError();
        }
    } catch(error) {
        feedback=resourceNotFound();
    }
    res.status(feedback.statuscode).json(feedback);
}

const deleteuser = async (req, res)=>{
    const {email} = req.body;
    let feedback = createFeedback(404, `User ${email} could not be deleted`);
    if(typeof(email)!=='undefined'){
        try {
            const result = await User.findOneAndDelete({email});
            if(result){
                feedback=createFeedback(200, `${email} was deleted!`, true, result);
            }
        }catch(error){
            console.log('error!');
        }
    }
    res.status(feedback.statuscode).json(feedback);
}

// Tokens are deleted in the authorization middleware, and a user is passed on
// based on the tokens that are deleted. If no user is provided, the tokens was 
// non-existent.
const logoutuser = async (req, res)=> {
    let feedback = createFeedback(404, 'user not found!');
    const {user} = req.body;
    if(user){
        feedback = createFeedback(200, `${user.email} has been logged out!`, true);
    }
    res.status(feedback.statuscode).json(feedback);
}

const loginuser = async (req, res)=> {
    const {email, password} = req.body;
    let feedback=accessDenied();
    try {
        const user = await User.login(email,password);
        if(user){
            const {_id} = user;
            //expiration: one hour
            const accessToken = generateAccessToken(_id)
            const refreshToken = await generateRefreshToken(_id);
    
            if(refreshToken){
                feedback=createFeedback(200, `${email} was authenticated`, true, {accessToken, refreshToken});
            } else {
                feedback=internalServerError();
            }
        }
    } catch(err){
        console.error("usercontroller: loginuser:",err.message);
    }
    res.status(feedback.statuscode).json(feedback);
}

/**
 * This controller checks for req.body.refreshToken, looks up the token in the corresponding
 * database and checks if it is valid. If it is valid, it authenticates the user and sends
 * a new accesstoken.
 */
const refreshUser = async (req, res)=>{
    const {_id} = req.body.user;
    const accessToken=generateAccessToken(_id);
    const feedback= createFeedback(200,'Token refreshed!', true, {accessToken})

    res.status(feedback.statuscode).json(feedback);
}


function generateAccessToken(_id){
    const cryptotoken = crypto.randomBytes(32).toString('hex');
    return jwt.sign({_id, cryptotoken}, process.env.JWTSECRET, {expiresIn:"1h"});
}

//generates a refresh token that is valid for one week
async function generateRefreshToken(_id){
    const expireDays=7; //jwt token measure expire in days
    const expireTime= new Date(); //Mongodb handles expiry better if it is a date
    expireTime.setDate(expireTime.getDate()+expireDays);

    const cryptotoken = crypto.randomBytes(32).toString('hex');

    const refreshToken = jwt.sign({_id, cryptotoken}, process.env.JWTSECRET, {expiresIn:`${expireDays}d`});

    const result = await RefreshToken.create({jwt:refreshToken, cryptotoken, expireTime});
    return refreshToken;
}

function sendresponse(response,feedback){
    response.status(feedback.statuscode).json(feedback);
}

module.exports={
    createuser,
    loginuser,
    logoutuser,
    deleteuser,
    upgradeuser,
    refreshUser
}