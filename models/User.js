const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const PASSWORDLENGTH=8;

const userschema=mongoose.Schema({
    username: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    role: {
        type: String,
        required: true,
        enum: ['user','admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: true,
        minlength: [PASSWORDLENGTH, `Passwords must have at least this many letters: ${PASSWORDLENGTH}`]
    }
},
{timestamps: true})

userschema.pre('save', hashPassword);

userschema.statics.login=login;
userschema.methods.changeUserRole=changeUserRole;

/**
 * @param {*} username of the user to log in
 * @param {*} password of the user to log in
 * @returns the user if credentials is successfully validated or null in any other case.
 */
async function login(username, password){
    let loginresult = null;
    const user = await this.findOne({username});
    if(user){
        const auth = await bcrypt.compare(password, user.password);
        if(auth) loginresult=user;
    }
    return loginresult;
}


async function hashPassword(next){
    if(this.isModified('password')){
        const salt = await bcrypt.genSalt();
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
}

/**
 * This function downgrades users by default. This is to ensure that any upgrade is
 * an explicit choice. 
 * @param {Boolean} isDowngrade if false, will upgrade 
 */
async function changeUserRole(isDowngrade=true){
    let updatedUser=null;
    if(isDowngrade) {
        this.role='user';
    } else {
        this.role='admin';
    }
    try {
        updatedUser = await this.save();

    } catch(error){
        throw error;
    }
    return updatedUser;
}
const User = mongoose.model('user',userschema);

module.exports=User;