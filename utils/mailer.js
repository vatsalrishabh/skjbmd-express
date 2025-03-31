const nodemailer = require('nodemailer');

// Configure the transporter for sending emails
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.PulseCareEmail, // Your DKLean email address
        pass: process.env.EmailPassword // Your email password (stored securely in environment variables)
    }
});

// Function to send OTP email
const sendOtpEmail = (to, otp, subject) => {
    const mailOptions = {
        from: process.env.PulseCareEmail, // Sender email address
        to, // Recipient email address
        subject: subject, // Email subject
        text: `${subject}: ${otp}.`,
        html: `
            <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                    <div style="background-color: #4CAF50; padding: 20px; text-align: center;">
                        <h1 style="color: #ffffff; font-size: 24px; font-weight: bold; margin: 0;">Welcome to DKLean!</h1>
                    </div>
                    <div style="padding: 20px; color: #333; line-height: 1.6;">
                        <p>Dear User,</p>
                        <p>Thank you for choosing DKLean. To ensure the security of your account, please verify your email with the One-Time Password (OTP) below:</p>
                        <div style="text-align: center; margin: 20px 0;">
                            <span style="font-size: 28px; font-weight: bold; color: #4CAF50;">${otp}</span>
                        </div>
                        <p>Please use the OTP above to complete your registration or login.</p>
                        <p>At DKLean, we are committed to delivering the best cleaning solutions to make your life easier and your spaces spotless.</p>
                    </div>
                    <div style="background-color: #f1f1f1; padding: 15px; text-align: center;">
                        <p style="font-size: 14px; color: #555; margin: 0;">Need help? Contact our support team at <a href="mailto:support@dklean.com" style="color: #4CAF50; text-decoration: none;">support@dklean.com</a>.</p>
                        <p style="font-size: 12px; color: #888; margin: 10px 0 0;">&copy; 2024 DKLean. All rights reserved.</p>
                    </div>
                </div>
            </div>
        `,
    };

    // Send the email
    return transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
};

module.exports = {
    sendOtpEmail
};
