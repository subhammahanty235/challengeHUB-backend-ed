const { accountCreatedMail } = require('../emailSystem/sendLoginEmail');
const User = require('../models/user.model')
const publishEmailRequest = require('../publishers/mailPublishers')
exports.createProfile = async (req, res) => {
    try {
        const { profileData } = req.body
        const userId = req.user.id;
        //check if profile exists or not
        const user = await User.findOne({ _id: userId });

        if (!user) {
            return res.status(400).json({ success: false, message: "User not exists" });
        }

        const response = await User.findByIdAndUpdate(userId, profileData);

        if (response) {
            const responsein = await User.findByIdAndUpdate(response.id, { profileCreated: true, joined: new Date() })
            if (responsein) {
                const emailData = {
                    templateId: 'welcome_mail',
                    recipient: user.emailId,
                    subject: 'Welcome to ChallengeHUB',
                    data: {
                        name: profileData.name,
                        purpose: 'OTP verification ',
                    }
                };

                publishEmailRequest('authentication', emailData)
                return res.status(200).json({ success: true, message: "Profie created successfully" })
            }
        } else {
            return res.status(200).json({ success: true, message: "Some Error occured" })
        }


    } catch (error) {

    }
}

exports.getuser = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findOne({ _id: userId });
        if (!user) {
            return res.status(400).json({ success: false, message: "User not exists" });
        }
        return res.status(200).json({ success: true, user: user, message: "Profie fetched successfully" })

    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}