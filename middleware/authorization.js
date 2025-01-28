// Geir Hilmersen
// 10 May 2024 Geir Hilmersen

const jwt=require('jsonwebtoken');
const User = require('../models/User');
const fs = require('fs');
const RefreshToken = require('../models/RefreshToken');

const publicKey = fs.readFileSync('./keys/jwt-public.pem', 'utf-8');

const {
    createFeedback,
    accessDenied,
    resourceNotFound
}=require('../handlers/httpFeedbackHandler');

const {
    setTokenBan,
    isTokenBanned
} = require('../handlers/redishandler');

const authenticate = async (req,res,next) => {
    const accesstoken = req.headers.authorization?.split(' ')[1];
    let feedback = accessDenied();
    if(typeof(accesstoken)!=='undefined'&&typeof(accesstoken)==='string'){
        try {
            const {_id, cryptotoken} = jwt.verify(accesstoken, publicKey,{algorithms:['RS256']});
            const isBanned= await isTokenBanned(cryptotoken);
            if(!isBanned){
                const user = await User.findOne({_id});
                req.body.user=user;
                next();
            } else {
                feedback = createFeedback(409, 'Accesstoken not valid!');
                sendresponse(res,feedback);
            }
        } catch(error){
            sendresponse(res,feedback);
        }
    } else {
        sendresponse(res,feedback);
    }
}

const authenticateRefreshToken = (req,res,next) => {
    let refreshToken = req.headers.authorization?.split(' ')[1];
    let feedback=accessDenied();
    if(typeof(refreshToken) !== 'undefined' && typeof(refreshToken)==='string'){
        feedback = createFeedback(409, 'Token not valid');
        jwt.verify(refreshToken, publicKey, {algorithms:['RS256']}, async(err, decodedtoken)=>{
            if(!err){
                const {cryptotoken,_id}=decodedtoken;
                try {
                    refreshToken = await RefreshToken.findOne({cryptotoken})
                    const user = await User.findOne({_id});
                    if(refreshToken&&user) {
                        req.body.user=user;
                        next();
                    } else {
                        sendresponse(res,feedback);
                    }
                } catch(err){
                    sendresponse(res,feedback);
                }
            } else {
                sendresponse(res,feedback);
            }
        });
    } else {
        sendresponse(res,feedback);
    }
}

const authorizeAdmin = (req,res,next)=>{
    const user = req.body.user;
    if(user && typeof(user) !== 'undefined' && user.role==='admin'){
        next();
    } else {
        const feedback = createFeedback(403, 'Not authorized!');
        sendresponse(res,feedback);
    }
}

//Removes refreshtokens and bans accesstoken regardless of eachother.
//Any token found is removed. A valid accesstoken without a refreshtoken
//will be banned. A refreshtoken will be removed from the DB even if no
//valid accesstoken is found in case of tampering. Zero thrust security!
const invalidateRefreshToken = async (req, res, next) => {
    console.info('invalidating method');
    let feedback = resourceNotFound();
    try {
        const refreshToken = req.headers.authorization?.split(' ')[1];
        const decoded = jwt.decode(refreshToken, { complete: true });
        console.log(decoded)
        // Remove the refresh token
        const {_id,cryptotoken} = jwt.verify(refreshToken, publicKey,{algorithms:['RS256']});
        
        req.body.user= await User.findOne({_id});
        //Remove refreshtoken from db to prevent accesstokens from refreshing
        const result = await RefreshToken.findOneAndDelete({cryptotoken});
        if(!result){
            //needs implementation - may be tampering!
            console.warn('Tried deleting a refreshtoken, but token vas not in the database!')
        }
        next();
    } catch(err) {
        console.error('\nAn error occurred while removing a token:\n'+
                      '\n'+err);
        sendresponse(res,feedback);
    }
}

const invalidateAccessToken = async (req, res, next) => {
    const {accessToken} = req.body;
    try { 
        let {cryptotoken, exp} =  jwt.verify(accessToken, publicKey, {algorithms:['RS256']});
        //let decoded =  jwt.verify(accessToken, publicKey, {algorithms:['RS256']});
        const bantime = exp - Math.ceil((Date.now()/1000));
        //Ban accesstoken in redis for the remaining duration of the token (bantime=seconds)
        setTokenBan(cryptotoken, accessToken, bantime);
        console.log('token was banned, going next!')
        next();
    } catch (error) {
        if(error.name!=='TokenExpiredError'){
            console.log(error)
            sendresponse(res, createFeedback(401, "Corrupted access token!"));
        } else {
            // its ok to proceed if the token is valid, but not corrupted. 
            console.error('invalidateAccessToken: ', error);
            next();
        }
    }
}

function sendresponse(response, feedback) {
    response.status(feedback.statuscode).json(feedback);
}

module.exports={
    authenticate,
    authorizeAdmin,
    authenticateRefreshToken,
    invalidateRefreshToken,
    invalidateAccessToken
}