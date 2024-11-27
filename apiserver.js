require('dotenv').config();
const appEventHandler = require('./handlers/appEventHandler');
const express = require('express');
const app = express();
const documentation_routes=require('./routes/documentation_routes');
const user_api=require('./routes/api_user_routes');
const {startScheduler}=require('./services/scheduler');

const {enableRedis}=require('./handlers/redishandler')

const {
    mongoConnect
} = require('./handlers/dbhandler');

const PORT = process.env.PORT || 3000;
const DBURI = process.env.DBURI || '';

//setup bodyparsing
app.use(express.urlencoded({extended:true}));
app.use(express.json());
setupDocumentationViews();
app.use(user_api);

app.listen(PORT, ()=>{
    console.log(`Revving engine...`);
    console.log(`Server started at port ${PORT}\n------------------------------------`);
    try {
        enableMongoAndRedis(DBURI); 
    } catch(error) {
        console.error(error.message);
        console.info('Exiting! Infrastructure not complete!');
        process.exit(1);
    }
    
    startScheduler();
});

async function enableMongoAndRedis(DBURI, REDISURI){
    try {
        await mongoConnect(DBURI);   
        await enableRedis(); 
    } catch(error) {
        console.error(error.message);
        console.error('Exiting! Infrastructure not installed, or misconfigured!');
        process.exit(1);
    }
}

function setupDocumentationViews(){
    const path = require('path')

    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));
    app.use(express.static('public'))
    app.use(documentation_routes);

}