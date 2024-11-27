const mongoose = require('mongoose');
const {Schema} = mongoose;

const refreshTokenSchema = new Schema({
    jwt: {
        type: String,
        required: true
    },
    cryptotoken: {
        type: String,
        required: true
    }, expireTime: {
        type: Date,
        required: true
    }
});

refreshTokenSchema.statics.cleanUpExpiredRefreshTokens=cleanUpExpiredRefreshTokens;

async function cleanUpExpiredRefreshTokens(batchsize=500){
    console.info('Cleaning up expired refreshTokens!');
    const dateNow = new Date();
    let totalDeleted=0;
    let iterationDeleted;
    try {
        do {
            iterationDeleted=0;
            const expiredTokens = await this.find({expireTime: {$lt:dateNow}}).limit(batchsize);
            const tokensInBatch=expiredTokens.length;
            if(tokensInBatch>0){
                if(tokensInBatch<batchsize) console.info(`Removing last batch in cleanup of ${tokensInBatch} refreshtokens`)
                const ids=expiredTokens.map(token=>token._id);
                const result = await this.deleteMany({_id:{$in: ids}});
                iterationDeleted=result.deletedCount;
                totalDeleted=totalDeleted+iterationDeleted;
            }
        } while(iterationDeleted > 0);
    } catch (error){
        console.error('Cleaning up tokens failed\n'+
        '------------------------\n'+
        error);
    } finally {
        const readableDate = dateNow.toLocaleString();
        console.info(
        `------------------------------------------------------\n` +
        `Expired refreshtokens was removed from the database:\n`+
        `${totalDeleted} tokens removed - date: ${readableDate}`);
    }
}
const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

module.exports= RefreshToken;