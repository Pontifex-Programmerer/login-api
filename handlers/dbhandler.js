const mongoose = require('mongoose');
const DBNAME= process.env.USERDB || "dev-login-api";

const mongoConnect = URI => {
    console.info('DBHandler.mongoConnect() - Attempting to connect to mongo')
    if(URI && typeof URI !== 'undefined') {

        let state = 'unresolved'
        console.info(`Attempting to connect to mongo database @ URI: \n${URI}`)
        mongoose.connect(URI, {
            DBNAME
        })
        .then(result => {
            // TODO: handle result
            state = 'established!'
        })
        .catch(err=>{
            console.error('\n',err,'\n');
            state= 'unresolved!'
        })
        .finally(()=>{
            console.info(`Connection to database ${state}`);
        })
    } else {
        console.error('DBHandler.mongoConnect() - No URI provided! Connectionattempt aborted!')
    }
}

async function cleanUp(){
    try{
        await mongoose.disconnect();
        console.info('mongoclient disconnected!');
    } catch(err){
        console.error(
            'Error while disconnecting from redis:\n'+
            '-------------------------------------\n'+
            err,
            '-------------------------------------\n');
    }
}

module.exports={
    mongoConnect,
    cleanUp
}