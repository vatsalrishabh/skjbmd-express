const nodemailer = require('nodemailer');

// Configure the transporter for sending emails
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.PulseCareEmail,
        pass: process.env.EmailPassword
    }
});

// Function to send OTP email
const sendOtpEmailForgot = (to, otp, subject) => {
    const mailOptions = {
        from: process.env.PulseCareEmail,
        to,
        subject: subject,
        html: `
            <div style="font-family: 'Segoe UI', sans-serif; background-color: #fff8f0; color: #333; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="text-align: center; color: #d32f2f; margin-bottom: 20px;">श्री कृष्ण जन्मभूमि मुक्ति दल</h2>
                <p style="font-size: 16px;">प्रिय सदस्य,</p>
                <p style="font-size: 16px;">आपके पासवर्ड रीसेट करने का अनुरोध प्राप्त हुआ है। कृपया नीचे दिए गए OTP का उपयोग करें:</p>
                
                <div style="text-align: center; margin: 20px 0;">
                    <span style="
                        font-size: 28px;
                        color: #d32f2f;
                        font-weight: bold;
                        background-color: #fff0f0;
                        padding: 12px 24px;
                        border-radius: 6px;
                        display: inline-block;
                        letter-spacing: 2px;
                        animation: fadeIn 2s ease-in-out;
                    ">
                        ${otp}
                    </span>
                </div>

                <p style="font-size: 16px;">यदि आपने यह अनुरोध नहीं किया है, तो कृपया इस ईमेल को अनदेखा करें।</p>
                <p style="font-size: 16px;">कोई परेशानी होने पर हमसे संपर्क करें।</p>

                <p style="margin-top: 30px; font-size: 14px; color: #777;">सादर,<br/>श्री कृष्ण जन्मभूमि मुक्ति दल टीम</p>
            </div>

            <style>
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            </style>
        `,
    };

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
