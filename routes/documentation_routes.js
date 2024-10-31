// Geir Hilmersen 
// 31 Okt 2024

const router = require('express').Router();
const {
    index
} = require('../controllers/documentation_controller')

router.get('/', index);

router.get('/courtesy-route',(req,res)=> {
    res.json({message:'you have connected to jwt-demoapp api, and it is running!'});
})

module.exports=router;