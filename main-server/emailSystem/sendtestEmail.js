const router = require("express").Router();
const nodemailer = require("nodemailer");

const client = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "chbspprt@gmail.com",
        pass: "ofkbghmkrajftdby"
    }
});

//mails in function form to call from backend

const sendInactiveMail = (data) => {
    client.sendMail(
        {
            from: "chbspprt@gmail.com",
            to: [data.emailId, "subhammahanty235@gmail.com"],
            subject: `Unlock Your Potential: Dive into Challenges and Kickstart 2024 with Challenge Hub! 🚀`,
            html: `
            <div style="border: 1px solid #999; padding: 20px; border-radius: 8px; background: linear-gradient(to right, #4a4a4a, #242424); text-align: center; color: #fff; font-family: 'Arial', sans-serif;">
            <h1 style="color: #fff; font-size: 28px; letter-spacing: 2px; margin-bottom: 10px;">Hey ${data.name}! 👋</h1>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">We hope you're enjoying Challenge Hub! 🌟</p>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">You've taken the first step by creating your account, but there's a whole world of challenges waiting for you to explore. 🚀</p>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Participating in challenges not only boosts your progress but also makes the journey enjoyable and rewarding. 🏆</p>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">As we approach 2024, seize the opportunity to kickstart your year with our special challenges. 🎉</p>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Don't miss out! Dive into the world of challenges and make 2024 a year of transformation. 💪</p>
            
            <a href="https://challengehub.vercel.app" style="text-decoration: none;" target="_blank">
                <button style="background-color: #535bf2; color: #fff; padding: 10px 20px; border: none; border-radius: 5px; font-size: 16px; cursor: pointer;">Explore Challenge Hub</button>
            </a>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 10px;">Best Regards, <br>Challenge Hub 🚀</p>
            <p style="font-size: 13px; line-height: 1.6; margin-bottom: 10px; color: #999;">To stop recieving mails, please reply with 'STOP'.</p>

        </div>
            `

        }, (err, data) => {
            if (err) {
                console.log("Error" + err)
            } else {
                res.send("Email sent")
            }
        }
    )
}

const sendNotParticipatinMail = (data) => {
    client.sendMail({
        from: "chbspprt@gmail.com",
        to: [data.emailId,"subhammahanty235@gmail.com"],
        subject: `Reignite Your Commitment: Your Journey on Challenge Hub Awaits! 🚀`,
        html: `
        <div style="border: 1px solid #999; padding: 20px; border-radius: 8px; background: linear-gradient(to right, #4a4a4a, #242424); text-align: center; color: #fff; font-family: 'Arial', sans-serif;">
    <h1 style="color: #fff; font-size: 28px; letter-spacing: 2px; margin-bottom: 10px;">Hey ${data.name}! 👋</h1>
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">We hope this message finds you well on your journey with Challenge Hub! 🌟</p>
    
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">We've noticed you haven't participated in your challenge "<strong>${data.challengeName}</strong>" for more than ${data.totalInactiveDays} days. Your commitment is essential not only for your personal growth but also for maintaining a positive impact on your overall score and achievements. 🚀</p>
    
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Remember, each day you engage with the challenge contributes to your commitment score, reflecting your dedication and consistency. Your commitments play a crucial role in your journey toward achieving your goals. 💪</p>
    
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Renew your commitment, get back on track, and watch how consistent efforts lead to significant personal achievements. Your progress is a reflection of your commitment to self-improvement. 🌈</p>
    
    <a href="https://challengehub.vercel.app" style="text-decoration: none;" target="_blank">
        <button style="background-color: #535bf2; color: #fff; padding: 10px 20px; border: none; border-radius: 5px; font-size: 16px; cursor: pointer;">Join Your Challenge Now</button>
    </a>
    
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 10px; color: #999;">If you have any questions or need support, please don't hesitate to reply to this email.</p>
    
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 10px;">Commit to your journey, and let's make your goals a reality!</p>
    
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 10px;">Best Regards, <br>Challenge Hub Team 🚀</p>
    <p style="font-size: 13px; line-height: 1.6; margin-bottom: 10px; color: #999;">To stop recieving mails, please reply with 'STOP'.</p>
</div>

        `
    })
}


router.post("/reminder", (req, res) => {

    // reminder for not participating in any challenge after logging in
    const data = req.body;
    client.sendMail(
        {
            from: "chbspprt@gmail.com",
            to: [data.emailId, "subhammahanty235@gmail.com"],
            subject: `Unlock Your Potential: Dive into Challenges and Kickstart 2024 with Challenge Hub! 🚀`,
            html: `
            <div style="border: 1px solid #999; padding: 20px; border-radius: 8px; background: linear-gradient(to right, #4a4a4a, #242424); text-align: center; color: #fff; font-family: 'Arial', sans-serif;">
            <h1 style="color: #fff; font-size: 28px; letter-spacing: 2px; margin-bottom: 10px;">Hey ${data.name}! 👋</h1>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">We hope you're enjoying Challenge Hub! 🌟</p>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">You've taken the first step by creating your account, but there's a whole world of challenges waiting for you to explore. 🚀</p>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Participating in challenges not only boosts your progress but also makes the journey enjoyable and rewarding. 🏆</p>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">As we approach 2024, seize the opportunity to kickstart your year with our special challenges. 🎉</p>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Don't miss out! Dive into the world of challenges and make 2024 a year of transformation. 💪</p>
            
            <a href="https://challengehub.vercel.app" style="text-decoration: none;" target="_blank">
                <button style="background-color: #535bf2; color: #fff; padding: 10px 20px; border: none; border-radius: 5px; font-size: 16px; cursor: pointer;">Explore Challenge Hub</button>
            </a>
            
            // <p style="font-size: 16px; line-height: 1.6; margin-bottom: 10px;">Wishing you a fantastic New Year filled with achievements and personal growth! 🎆</p>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 10px;">Best Regards, <br>Challenge Hub 🚀</p>
            <p style="font-size: 13px; line-height: 1.6; margin-bottom: 10px; color: #999;">If you find any difficulties or have any suggestions, please reply to this email.</p>
            <p style="font-size: 13px; line-height: 1.6; margin-bottom: 10px; color: #999;">To stop recieving mails, please reply with 'STOP'.</p>

        </div>
        
        

            `

        }, (err, data) => {
            if (err) {
                console.log("Error" + err)
            } else {
                res.send("Email sent")
            }
        }
    )
    res.send("Compiled")

})
router.post("/newyearwish", (req, res) => {

    // reminder for not participating in any challenge after logging in
    const data = req.body;
    client.sendMail(
        {
            from: "chbspprt@gmail.com",
            to: [data.emailId, "subhammahanty235@gmail.com"],
            subject: `Unlock Your Potential: Dive into Challenges and Kickstart 2024 with Challenge Hub! 🚀`,
            html: `
            <div style="border: 1px solid #999; padding: 20px; border-radius: 8px; background: linear-gradient(to right, #4a4a4a, #242424); text-align: center; color: #fff; font-family: 'Arial', sans-serif;">
    <h1 style="color: #fff; font-size: 28px; letter-spacing: 2px; margin-bottom: 10px;">🎉 Happy New Year, ${data.name}! 🎆</h1>
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">As the clock strikes midnight, we wish you a year filled with joy, success, and new achievements!</p>
    
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">May 2024 be a canvas of endless possibilities for personal growth and positive transformations.</p>
    
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">At Challenge Hub, we're excited about the adventures that await you in the coming year. 🚀</p>
    
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Explore our diverse challenges designed to make your journey towards self-improvement exciting and rewarding. 🌟</p>
    
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Whether you're looking to learn a new skill, build healthy habits, or simply have fun, there's a challenge for everyone!</p>
    
    <a href="https://challengehub.vercel.app" style="text-decoration: none;" target="_blank">
        <button style="background-color: #535bf2; color: #fff; padding: 10px 20px; border: none; border-radius: 5px; font-size: 16px; cursor: pointer;">Discover Challenges Now</button>
    </a>
    
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">May your journey on Challenge Hub be filled with achievements, growth, and memorable moments. Cheers to a fantastic 2024!</p>
    
    
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 10px;">Best Regards, <br>Challenge Hub Team 🚀</p>
    <p style="font-size: 13px; line-height: 1.6; margin-bottom: 10px; color: #999;">If you have any questions or suggestions, please reply to this email.</p>
    <p style="font-size: 13px; line-height: 1.6; margin-bottom: 10px; color: #999;">To stop recieving mails, please reply with 'STOP'.</p>

    </div>

        
        

            `

        }, (err, data) => {
            if (err) {
                console.log("Error" + err)
            } else {
                res.send("Email sent")
            }
        }
    )
    res.send("Compiled")

})

router.post("/invite", (req, res) => {
    const data = req.body; // assuming data contains an array of email IDs
    const emailList = data.emailIds; // array of 100 email addresses
    let index = 1;

    const sendEmail = (email, delay) => {
        setTimeout(() => {
            client.sendMail(
                {
                    from: "chbspprt@gmail.com",
                    to: email,
                    subject: `This Diwali, Challenge Yourself to Be the Person You've Always Wanted to Be! 🌟`,
                    html: `
                    <div style="border: 1px solid #999; padding: 20px; border-radius: 8px; background: linear-gradient(to right, #4a4a4a, #242424); text-align: center; color: #fff; font-family: 'Arial', sans-serif;">
                        <h1 style="color: #fff; font-size: 28px; letter-spacing: 2px; margin-bottom: 10px;">Hello! 👋</h1>
                        <p style="font-size: 18px; line-height: 1.6; margin-bottom: 20px;">This Diwali, challenge yourself to become the person you've always aspired to be. 🌟</p>
                        
                        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">You're invited to join Challenge Hub, a platform that empowers you to push boundaries, unlock potential, and achieve your personal goals through inspiring challenges. 🚀</p>
                        
                        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Challenge Hub offers a range of activities designed to help you grow, hone your skills, and celebrate each milestone on your journey to self-improvement. 🏆</p>
                        
                        <a href="https://challengehub.vercel.app" style="text-decoration: none;" target="_blank">
                            <button style="background-color: #535bf2; color: #fff; padding: 10px 20px; border: none; border-radius: 5px; font-size: 16px; cursor: pointer;">Join Challenge Hub</button>
                        </a>
                        
                        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 10px;">Let’s make this Diwali the start of a transformative journey. 🎉</p>
                        
                        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 10px;">Best Regards, <br>Challenge Hub Team 🚀</p>
                        <p style="font-size: 13px; line-height: 1.6; margin-bottom: 10px; color: #999;">If you have any questions or feedback, please reply to this email.</p>
                        <p style="font-size: 13px; line-height: 1.6; margin-bottom: 10px; color: #999;">To stop receiving invites, please reply with 'STOP'.</p>
                    </div>
                    `
                },
                (err, data) => {
                    if (err) {
                        console.log(`Error sending email to ${email}: ` + err);
                    } else {
                        console.log(`Sent email to ${email} - Count: ${index}`);
                    }
                }
            );

            index++;
        }, delay);
    };

    emailList.forEach((email, idx) => {
        sendEmail(email, idx * 15000); // 20 seconds interval
    });

    res.send("Invitations are being sent to all users with a 20-second interval.");
});



module.exports = { router, sendInactiveMail , sendNotParticipatinMail}