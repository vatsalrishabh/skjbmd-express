const nodemailer = require('nodemailer');

// Configure the transporter for sending emails
const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use other email services if needed
    auth: {
        user: process.env.PulseCareEmail, // Your PulseCare email address
        pass: process.env.EmailPassword   // Your email password (preferably stored securely in environment variables)
    }
});

// Function to send OTP email
const sendOtpEmailForgot = (to, otp, subject) => {
    const mailOptions = {
        from: process.env.PulseCareEmail, // Sender email address
        to, // Recipient email address
        subject: subject, // Email subject
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 8px;">
                <h2 style="color: #4CAF50; text-align: center; margin-bottom: 20px;">Dklean Password Reset</h2>
                <p style="font-size: 16px;">Dear User,</p>
                <p style="font-size: 16px; margin-bottom: 20px;">We received a request to reset your password. Please use the One-Time Password (OTP) provided below to complete the process.</p>
                <div style="text-align: center; margin: 20px 0;">
                    <span style="
                        font-size: 24px;
                        color: #4CAF50;
                        font-weight: bold;
                        background-color: #e8f5e9;
                        padding: 10px 20px;
                        border-radius: 5px;
                        display: inline-block;
                        animation: fadeIn 2s;
                    ">
                        ${otp}
                    </span>
                </div>
                <p style="font-size: 16px;">If you did not request a password reset, please ignore this email.</p>
                <p style="font-size: 16px; margin-top: 20px;">If you have any issues, please contact Dklean support.</p>
                <p style="font-size: 14px; color: #777; margin-top: 20px;">Best regards,<br/>The Dklean Team</p>
            </div>
            <style>
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
            </style>
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
    sendOtpEmailForgot
};
