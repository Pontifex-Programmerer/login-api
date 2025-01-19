// Created by: Geir Hilmersen
// 26 December 2024 Geir Hilmersen

const router = require('express').Router();
const {
    authenticate,
    authenticateRefreshToken,
    invalidateRefreshToken,
    invalidateAccessToken,
    authorizeAdmin
} = require('../middleware/authorization');

const {
    createuser,
    loginuser,
    logoutuser,
    deleteuser,
    upgradeuser,
    refreshUser
} = require('../controllers/usercontroller');

//Authentication
router.post('/create-user', createuser);
router.post('/login-user', loginuser);
router.post('/refresh-user', invalidateAccessToken, authenticateRefreshToken, refreshUser);
router.post('/logout', invalidateAccessToken, invalidateRefreshToken, logoutuser)


//Protected routes
router.delete('/delete-user', authenticate, authorizeAdmin, deleteuser);
router.patch('/create-admin', authenticate, authorizeAdmin, upgradeuser);

module.exports=router;