const router = require('express').Router();

const {
    userAuthTest,
    adminAuthTest
} = require('../controllers/testroute_controller');

const {
    authorizeAdmin,
    authenticate
} = require('../middleware/authorization');

router.get('/user-access-test', authenticate, userAuthTest);

router.get('/admin-access-test', authenticate, authorizeAdmin, adminAuthTest);

module.exports=router;