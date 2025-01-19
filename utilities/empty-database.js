require('dotenv').config({path:'../.env'});
const User = require('../models/User');

const {
    mongoConnect,
    cleanUp
} = require('../handlers/dbHandler');

emptyUserDB();

async function emptyUserDB() {
    try {
        await mongoConnect(process.env.DBURI,{dbName:process.env.DBNAME});
        await User.deleteMany({})
    } catch(error) {
        console.error(error.message);
    } finally {
        console.info(`${process.env.DBURI}/${process.env.DBNAME}\nhas been purged!\n----------------------------------\n`)
        cleanUp();
    }
}

