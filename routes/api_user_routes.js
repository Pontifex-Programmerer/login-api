const router = require('express').Router();
const {
    authenticate,
    authenticateRefreshToken,
    invalidateTokens,
    authorizeAdmin
} = require('../middleware/authorization');

const {
    createuser,
    loginuser,
    logoutuser,
    createtodo,
    removetodo,
    deleteuser,
    upgradeuser,
    refreshUser
} = require('../controllers/usercontroller');

//Authentication
router.post('/create-user', createuser);
router.post('/login-user', loginuser);
router.post('/refresh-user', authenticateRefreshToken, refreshUser);
router.post('/logout', invalidateTokens, logoutuser)


//Protected routes
router.post('/create-todo', authenticate, createtodo);
router.delete('/remove-todo', authenticate, removetodo);
router.delete('/delete-user', authenticate, authorizeAdmin, deleteuser);
router.patch('/create-admin', authenticate, authorizeAdmin, upgradeuser);

module.exports=router;