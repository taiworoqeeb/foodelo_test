const User = require('../model/Usermodel');
require('dotenv').config();
const { Strategy, ExtractJwt} = require('passport-jwt');

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.TOKEN
}

module.exports = (passport) => {
    passport.use(
        new Strategy(options, async(payload, done) => {
            // console.log(payload);
            await User.findById(payload.user.id).then(user => {
                // console.log(user);
            if(user){
                done(null, user);
                return;
            }
                done(null, false);
                return;
            
        })
        .catch(err => {
            console.error(err);
            done(null, false); 
            return;
        });
    })
    
    );
    passport.serializeUser(function (user, done) {
       done(null, user.id);
       return;
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
            return;
        });
    });
};