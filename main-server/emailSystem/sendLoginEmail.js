const nodemailer = require("nodemailer");

const client = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "chbspprt@gmail.com",
        pass: "ofkbghmkrajftdby"
    }
});

exports.sendOtpMail = (email, otp) => {
    client.sendMail(
        {
            from: "chbspprt@gmail.com",
            to: email,
            subject: "OTP for Challenge HUB",
            html: `
            <div style="border: 1px solid #999; padding: 10px; border-radius: 8px; background:#242424">
    <h1 style="color: #fff;">Challenge <span style="background-color: #fff; padding: 0px 5px; color: #535bf2; font-weight: 800; border-radius: 5px;">HUB</span></h1>
    <p style="color: #fff; font-size: 16px;">Thank you for being a part of Challenge Hub! Here's your One-Time Password (OTP) to log in:</p>
    <h3 style="color: #535bf2;">${otp}</h3>
    <p style="color: #fff; font-size: 16px;">Use this OTP within the next 10 minutes to access your Challenge Hub account securely.</p>
    <p style="color: #999; font-size: 16px;">If you did not request this OTP or need assistance, please contact our support team immediately.</p>
    <p style="color: #fff; font-size: 16px;">Regards,<br>Challenge Hub</p>
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

    console.log(email)
}

exports.accountCreatedMail = (name, email)=> {
    client.sendMail(
        {
            from: "chbspprt@gmail.com",
            to: email,
            subject: "Welcome to Challenge HUB",
            html: `
            <div style="border: 1px solid #999; padding: 20px; border-radius: 8px; background: #242424; text-align: center;">
    <h1 style="color: #fff;">Welcome to Challenge <span style="background-color: #fff; padding: 0px 5px; color: #535bf2; font-weight: 800; border-radius: 5px;">HUB</span>, ${name}!</h1>
    <p style="color: #fff; font-size: 16px;">Congratulations! You've successfully joined Challenge Hub, and we're thrilled to have you on board.</p>
    
    <p style="color: #fff; font-size: 16px;">At Challenge Hub, you can explore a variety of challenges, engage with a vibrant community, and even create your own challenges to share with others.</p>
    <p style="color: #fff; font-size: 16px;">Whether you're looking to learn something new, push your limits, or simply have fun, Challenge Hub is the place for you.</p>
    
    <p style="color: #999; font-size: 16px;">Don't procrastinate! Dive into Challenge HUB and start your journey of self-improvement today.</p>
    
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
    console.log(email)
}

