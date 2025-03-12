const {
    createFeedback
} = require('../handlers/httpFeedbackHandler');

const userAuthTest = (req,res) => {
    res.status(200).json(createFeedback(200, 'User authorized granted', true, {message: 'All checkpoints passed. User level confirmed', user: req.body.user}));
}

const adminAuthTest = (req,res) => {
    res.status(200).json(createFeedback(200, 'Admin authorized', true, {message: 'All checkpoints passed. Admin level confirmed', user:req.body.user}))
}


module.exports={
    userAuthTest,
    adminAuthTest
}