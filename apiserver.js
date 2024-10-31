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
    //mongoConnect(DBURI);   
    //enableRedis(); 
    
    startScheduler();
});

function setupDocumentationViews(){
    const path = require('path')
    const router = require('./routes/documentation_routes');

    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));
    app.use(documentation_routes);

}