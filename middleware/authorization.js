// Geir Hilmersen
// 10 May 2024 Geir Hilmersen

const jwt=require('jsonwebtoken');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');

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
            const {_id, cryptotoken} = jwt.verify(accesstoken, process.env.JWTSECRET);
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
        jwt.verify(refreshToken, process.env.JWTSECRET, async(err, decodedtoken)=>{
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
const invalidateTokens = async (req, res, next) => {
    let feedback = resourceNotFound();
    try {
        const refreshToken = req.headers.authorization?.split(' ')[1];
        const {accessToken} = req.body;
        if(typeof refreshToken !== 'undefined' && typeof refreshToken === 'string'){
            const {_id,cryptotoken} = await jwt.verify(refreshToken, process.env.JWTSECRET);
            req.body.user= await User.findOne({_id});
            //Remove refreshtoken from db to prevent accesstokens from refreshing
            const result = await RefreshToken.findOneAndDelete({cryptotoken});
            if(!result){
                //needs implementation - may be tampering!
                console.warn('Tried deleting a refreshtoken, but token vas not in the database!')
            }
        } else {
            feedback = createFeedback(404, ['invalid access token']);
            sendresponse(res,feedback);                   
        }

        if(typeof accessToken !== 'undefined' && typeof accessToken === 'string'){
            const {cryptotoken, exp} = await jwt.verify(accessToken, process.env.JWTSECRET);
            console.log(cryptotoken);
            const bantime = exp - Math.ceil((Date.now()/1000));
            //Ban accesstoken in redis for the remaining duration of the token
            setTokenBan(cryptotoken, accessToken, bantime);
        } else {
            if(feedback.payload){
                feedback = createFeedback(404, feedback.payload.push('invalid refresh token'));
            } else {
                feedback = createFeedback(404, 'invalid refresh token');
            }
            sendresponse(res, feedback);
        } 
        next();
    } catch(err) {
        console.error('\nAn error occurred while removing a token\n'+
                      '-----------------------------------------------'+
                      '\n'+err);
        sendresponse(res,feedback);
    }
}

function sendresponse(response, feedback) {
    response.status(feedback.statuscode).json(feedback);
}

module.exports={
    authenticate,
    authorizeAdmin,
    authenticateRefreshToken,
    invalidateTokens
}