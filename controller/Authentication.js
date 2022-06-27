const User = require("../model/Usermodel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateCode} = require("../helper");
const nodemailer = require("nodemailer");
const OTP = require("../model/OTP");
const Cart = require("../model/Carts");
const passport = require("passport")
require('dotenv').config();


const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const myOAuth2Client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    )

myOAuth2Client.setCredentials({
        refresh_token: process.env.REFRESH_TOKEN
});

const myAccessToken = myOAuth2Client.getAccessToken()

var transporter = nodemailer.createTransport({
    service: 'gmail',
    tls: {
        rejectUnauthorized: false
    },
    auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USERNAME, // generated ethereal user
        pass: process.env.EMAIL_PASSWORD, // generated ethereal password
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: myAccessToken
    },
  });

exports.Register = async(role, req, res, next)=>{
    const {firstname, lastname, username, email, password, phone_no, address } = req.body;
    try {
        var user = await User.findOne({
            email: email
        });

        if(user){
            res.status(401).json({
                status: false,
                message: "User Already Exist"
            })
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        if(role === 'admin'){
            var verify = true
        }else{
            verify = false
        }

        user = new User({
            firstname,
            lastname,
            username,
            email,
            password: hashedPass,
            phone_no,
            address,
            emailVerified: verify
        });
        const Newuser = await user.save();

        const new_cart = new Cart({
            user: Newuser._id
        });

        await new_cart.save();

        var token = generateCode();

        const new_otp = new OTP({
            user: Newuser._id,
            token: token
        })
        await new_otp.save()
        if(role === "user"){
           

       
            const mailOptions = {
                from:  `${process.env.E_TEAM}`,
                to: `${Newuser.email}`,
                subject: "Foodelo",
                html: `<h2>Hi ${Newuser.firstname}</h2>
                <br>
                <p>welcome to foodelo, complete your sign up process by verifying you email account using the one time password below</p>
                <br>
                <p>${token}</p>
                `
            };

            transporter.sendMail(mailOptions, function(err, info) {
                if(err){
                    console.log(err)
                } else {
                    console.log(info);
                    return res.status(201).json({
                        status: true,
                        message: "Account created and An email has been sent to you, Check your inbox"
                    })
                }
            });
        }
        

    } catch (error) {
        console.error(error)
        res.status(500).json({
             status: false,
             message: "Error occured",
             error: error
        });
        next(error);
    }
}

exports.LoginUser = async(role, req, res, next)=>{
    try {
        const {email, password} = req.body;
        var user = await User.findOne({
            email: email
        }).populate("password");

        if(!user){
            return res.status(404).json({
                status: false,
                message: 'User does not exist',
                
            });
        }

        if(!role.includes(user.role)){
            return res.status(401).json({
                status: false,
                message: "Please ensure you are logging-in from the right portal",
                
            });
        }

        const validate = await bcrypt.compare(password, user.password);
        if(validate){

            const payload = {
              user: {
                id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                username: user.username,
                email: user.email,
                role: user.role,
                phone_no: user.phone_no,
                address: user.address,
                emailVerified: user.emailVerified
              }
            }

            let token = jwt.sign(
                payload, 
                process.env.TOKEN, { expiresIn: "24h"});

                let result = {
                  token: `Bearer ${token}`,
                  _id: user._id,
                  firstname: user.firstname,
                  lastname: user.lastname,
                  username: user.username,
                  email: user.email,
                  role: user.role,
                  status: user.status,
                  phone_no: user.phone_no,
                  emailVerified: user.emailVerified,
                  expiresIn: 24
              };

            return res.status(200).json({
              user: result,
              message: "Successfully Logged In",
              status: true
            });

        } else{
           return res.status(403).json({
                message: 'Wrong Password',
                status: false
            });
        }
    } catch (error) {
        console.error(error)
        res.json(error)
        next(error)
        
    }
};

exports.emailVerify = async(req, res, next)=>{
    var {email, token }= req.body;
    try {
        await User.findOne({
            email: email
        }).then(async(user)=>{
            if(user){
                await OTP.findOne({
                    user: user._id
                }).then(async(otp)=>{
                    if(otp){
                        if(otp.token === token){
                            res.status(200).json({
                                status: true,
                                message: "Email Verified successfully"
                            })
                        }else{
                            res.status(401).json({
                                status: false,
                                message: "Invalid token"
                            })
                        }
                    }else{
                        res.status(401).json({
                            status: false,
                            message: "Invalid token"
                        })
                    }
                })
            }
        })
    } catch (error) {
        console.error(error)
        res.json(error)
        next(error)
    }
}

exports.resendCode = async(req, res, next)=>{
    const {email} = req.body;
    try {
        await User.findOne({
            email: email
        }).then(async(user)=>{
            if(user){
                await OTP.findOne({
                    user: user._id
                }).then(async(otp)=>{
                    if(otp){

                        var tp = generateCode();
                        await OTP.findByIdAndUpdate(otp._id, {token: tp});
                
                       
                            const mailOptions = {
                                from:  `${process.env.E_TEAM}`,
                                to: `${user.email}`,
                                subject: "Foodelo",
                                html: `<h2>Hi ${user.firstname}</h2>
                                <br>
                                <p>Your one time password is: </p>
                                <br>
                                <p><b>${tp}</b></p>
                                `
                            };
                
                            transporter.sendMail(mailOptions, function(err, info) {
                                if(err){
                                    console.log(err)
                                } else {
                                    console.log(info);
                                    res.status(201).json({
                                        status: true,
                                        message: "Check your inbox for otp"
                                    })
                                }
                            });
                    }else{
                        var tp = generateCode();

                        const new_otp = new OTP({
                            user: user._id,
                            token: tp
                        })
                        await new_otp.save()             
                       
                            const mailOptions = {
                                from:  `${process.env.E_TEAM}`,
                                to: `${user.email}`,
                                subject: "Foodelo",
                                html: `<h2>Hi ${user.firstname}</h2>
                                <br>
                                <p>Your one time password is</p>
                                <br>
                                <p><b>${tp}</b></p>
                                `
                            };
                
                            transporter.sendMail(mailOptions, function(err, info) {
                                if(err){
                                    console.log(err)
                                } else {
                                    console.log(info);
                                    res.status(201).json({
                                        status: true,
                                        message: "Check your inbox for otp"
                                    })
                                }
                            });
                    }
                })
            }else{
                res.status(401).json({
                    status: false,
                    message: "User doesn't exist"
                })
            }
        })
    } catch (error) {
        console.error(error)
        res.json(error)
        next(error)
    }
}

exports.resetPassword1 =async(req, res, next)=>{
    const {email} = req.body;
    try {
        await User.findOne({
            email: email
        }).then(async(user)=>{
            if(user){
                var tp = generateCode();
                await OTP.findOneAndUpdate({user: user._id}, {token: tp});
        
               
                    const mailOptions = {
                        from:  `${process.env.E_TEAM}`,
                        to: `${user.email}`,
                        subject: "Foodelo",
                        html: `<h2>Hi ${user.firstname}</h2>
                        <br>
                        <p>To reset your password, Your one time password is: </p>
                        <br>
                        <p><b>${tp}</b></p>
                        `
                    };
        
                    transporter.sendMail(mailOptions, function(err, info) {
                        if(err){
                            console.log(err)
                        } else {
                            console.log(info);
                            res.status(201).json({
                                status: true,
                                message: "Check your inbox for otp"
                            })
                        }
                    });
            }else{
                res.status(401).json({
                    status: false,
                    message: "User doesn't exist"
                })
            }
        })
    } catch (error) {
        console.error(error)
        res.json(error)
        next(error)
    }
}

exports.resetPassword2 = async(req, res, next)=>{
    const {email, token, newPassword, confirmPassword}= req.body;
    try {
        await User.findOne({
            email: email
        }).then(async(user)=>{
            if(user){
                await OTP.findOne({
                    user: user._id
                }).then(async(otp)=>{
                    if(otp){
                        if(otp.token === token){
                            if(newPassword=== confirmPassword){
                                const salt = await bcrypt.genSalt(10);
                                const hashedPass = await bcrypt.hash(password, salt);

                                await User.findByIdAndUpdate(user._id, {
                                    password: hashedPass
                                })

                                res.status(200).json({
                                    status: true,
                                    message: "Password reset successfully"
                                })
                            }else{
                                res.status(401).json({
                                    status: false,
                                    message: "Password don't match"
                                })
                            }
                        }else{
                            res.status(401).json({
                                status: false,
                                message: "invalid token"
                            })
                        }
                    }
                })
            }else{
                res.status(401).json({
                    status: false,
                    message: "User not found"
                })
            }
        })
    } catch (error) {
        console.error(error)
        res.json(error)
        next(error)
    }
}

exports.userAuth = passport.authenticate('jwt', {session: true});
exports.checkRole = roles => (req, res, next) => {
    if(!roles.includes(req.user.role)){ 
        return res.status(401).json({
            status: false,
            message: "Unauthorized"
          }) 
        }
       return next();
    };