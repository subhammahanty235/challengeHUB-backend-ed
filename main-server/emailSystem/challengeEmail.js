const nodemailer = require("nodemailer");

const client = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "chbspprt@gmail.com",
        pass: "ofkbghmkrajftdby"
    }
});


exports.joinedChallengeEmail = (name, email, challengeData) => {
    console.log(name)
    console.log(email)
    console.log(challengeData)
    client.sendMail(
        {
            from: "chbspprt@gmail.com",
            to: email,
            subject: `Joined a new Challenge`,
            html: `
            <div style="border: 1px solid #999; padding: 20px; border-radius: 8px; background: #242424; text-align: center;">
    <h1 style="color: #fff;"> Challenge <span style="background-color: #fff; padding: 0px 5px; color: #535bf2; font-weight: 800; border-radius: 5px;">HUB</span></h1>
    <p style="color: #fff; font-size: 16px;"> Hey ${name}, </br>Congratulations and welcome to ${challengeData.name}! You've taken the first step towards a new challenge journey.</p>
    
    <p style="color: #fff; font-size: 16px;">Get ready for an exciting ${challengeData.noOfdays} days challenge. Take a moment to prepare yourself mentally and physically for the rewarding journey ahead.</p>
    <p style="color: #fff; font-size: 16px;">Remember to mark each day as completed when you finish your daily tasks. Consider adding a brief note each day to track your progress and celebrate your achievements.</p>

    
    <p style="color: #999; font-size: 16px;">Don't procrastinate! Dive into the challenge, embrace the opportunities for growth, and make each day count in your journey of self-improvement.</p>
    
    <p style="color: #fff; font-size: 16px;">Best Regards,<br>Challenge Hub Team</p>
</div>

            `

        }, (err, data) => {
            if (err) {
                console.log("Error" + err)
            } else {
                console.log("Email send successfully")
            }
        }
    )
}

