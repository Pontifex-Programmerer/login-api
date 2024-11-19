//Geir Hilmersen 29 April 2024
//Last edit 29 April 2024

const ACCESSDENIED=401;
const UNAUTHORIZED=403;
const RESOURCENOTFOUND=404;
const INTERNALSERVERERROR=500;
const OK=200;

const FEEDBACK="Access Denied! - Authentication failed!";

function accessDenied(){
    return createFeedback(ACCESSDENIED, FEEDBACK);
}

function notAuthorized(){
    return createFeedback(UNAUTHORIZED,'Your authorization level does not allow you to access this feature!');
}

function internalServerError(){
    return createFeedback(INTERNALSERVERERROR, 'The server encountered an unexpected condition and could not fulfull your request. If this problem persist, please contact the server administrator with a description of your problem.')
}

function resourceNotFound(){
    return createFeedback(RESOURCENOTFOUND, 'The target of this operation was not found!');
}

/**
 * @param {*} statuscode has to be set manually
 * @param {*} feedback has to be set manually
 * @param {*} isSuccess defaults to false, must be overridden if true
 * @param {*} payload defaults to null
 * This factory method standardises the feedback from this API
 */
function createFeedback(statuscode, feedback, isSuccess=false,payload=null){
    return {
        statuscode,
        feedback,
        isSuccess,
        payload
    }
}

module.exports={
    createFeedback,
    accessDenied,
    notAuthorized,
    resourceNotFound,
    internalServerError
}