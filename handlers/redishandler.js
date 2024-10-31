//9. May 2024 Geir Hilmersen
//31. Oct 2024 Geir Hilmersen

const redis = require('redis')
const MAXCONNECTIONATTEMPTS = 3;
const DELAYBETWEENCONNECTIONATTEMPTS=1000; //millis
const client = redis.createClient({
    socket:{
        url: 'redis://127.0.0.1:6379',
        reconnectStrategy: retries => {
            console.log('retries', retries)
            if(retries>=3){
                console.error('RedisHandler: Max connectionattempts reached! Aborting');
                return false;
            }
            return DELAYBETWEENCONNECTIONATTEMPTS;
        }
    },
    maxRetriesPerRequest: MAXCONNECTIONATTEMPTS
});

client.on('connect', ()=>{
    console.info('Connection to redis successfully established')
})
client.on('error', err=> {
    console.error('Error! Could not connect to redis!\n-------------------------------------------\n',err,'\n');
})

async function enableRedis(connection){
    try {
        await client.connect();
    } catch (err){
        throw err;
    }
}

async function setTokenBan(tokenID, token, expireIn){
    try {
        const result = await client.setEx(tokenID, expireIn, token);
    } catch(err){
        console.error(err);
    }
}

// Assumes that the token has a false identity
// returns true if token is not found in the DB
async function isTokenBanned(tokenID){
    let result = true;
    try {
        const token = await client.get(tokenID);
        if(!token){
            result=false;
        }
    } catch(error){
        console.log('error', error)
    }
    return result;
}

async function cleanUp(){
    if(client.isOpen){

        try {
            await client.disconnect();
            console.info('redisclient disconnected!')
        } catch (err){
            console.error(
                'Error while disconnecting from redis:\n'+
                '-------------------------------------\n'+
                err,
                '-------------------------------------\n');
        }
    } else {
        console.info('RedisHandler.cleanup() - cleanup complete. Nothing to disconnect!');
    }
}
module.exports={
    enableRedis,
    isTokenBanned,
    setTokenBan,
    cleanUp
};