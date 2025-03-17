const { sendOtpMail } = require("../emailSystem/sendLoginEmail");
const TempOtp = require("../models/tempotp.model")
const User = require("../models/user.model")
const jwt = require("jsonwebtoken");
const publishEmailRequest = require('../publishers/mailPublishers')
const redis = require('../redisClient');
exports.generateOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: "Please provide a email" })
        }
        //a test login for testers
        if (email === 'chhub.testing@test.com') {
            const checkIfOtpExists = await TempOtp.findOne({ email: email });
            if (checkIfOtpExists) {
                await TempOtp.deleteOne({ email: email })
            }

            const otp = parseInt("09090");
            const to = await TempOtp.create({
                email: email,
                otp: otp,
                created: new Date(Date.now()),
                expiry: new Date(Date.now() + 2 * 60 * 1000)
            })
            return res.status(200).json({
                success: true,
                too: to,
                message: "OTP sent to your email",
            });
        }

        //find if there's already one otp present for the email
        const checkIfOtpExists = await TempOtp.findOne({ email: email });
        if (checkIfOtpExists) {
            await TempOtp.deleteOne({ email: email })
        }

        const otp = Math.floor(10000 + Math.random() * 90000);

        // const to = await TempOtp.create({
        //     email: email,
        //     otp: otp,
        //     created: new Date(Date.now()),
        //     expiry: new Date(Date.now() + 2 * 60 * 1000)
        // })
        await redis.set(`otp:${email}`, otp, "EX", 300);

        const emailData = {
            templateId: 'otp_sent_mail',
            recipient: email,
            subject: 'Your Verification Code',
            data: {
                otp: otp,
                purpose: 'OTP verification ',
                otpExpiry: 15
            }
        };

        publishEmailRequest('authentication', emailData)

        return res.status(200).json({
            success: true,
            message: "OTP sent to your email",
        });
    } catch (err) {
        console.log(err)
        return res.status(400).json({ success: false, message: err.message });
    }
}

exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const data = await redis.get(`otp:${email}`);

        if (!data) {
            return res.status(400).json({ success: false, message: "OTP expired" })

        }

        if (data !== otp) {
            return res.status(200).json({ success: false, message: "Wrong OTP" })
        }

        if (data === otp) {

            //check if user already exists
            const user = await User.findOne({ emailId: email })
            await redis.del(`otp:${email}`);
            if (user) {

                const data = {
                    user: {
                        id: user.id
                    }
                }
                const token = jwt.sign(data, "jwt67689797979");

                res.status(200).json({ success: true, token: token, user: user, message: "Logged in successfully" })
            } else {

                const user = await User.create({
                    emailId: email,
                    joined: new Date()
                })

                const data = {
                    user: {
                        id: user.id
                    }
                }
                const token = jwt.sign(data, "jwt67689797979");

                res.status(200).json({ success: true, token: token, user: user, message: "Logged in successfully" })


            }
        } else {
            res.status(400).json({ success: false, token: token, message: "Wrong OTP" })
        }


    } catch (error) {

    }
}

