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
        subject: subject,
        text: `${subject}: ${otp}. Use this OTP to verify your email.`,
        html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #ffffff; color: #333;">
          <div style="max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
            <h2 style="text-align: center; color: #8B0000;">ईमेल सत्यापन OTP</h2>
            <p>नमस्ते,</p>
            <p>आपके ईमेल पते की पुष्टि के लिए नीचे दिया गया OTP दर्ज करें:</p>
            <div style="text-align: center; margin: 20px 0;">
              <strong style="font-size: 26px; color: #000;">${otp}</strong>
            </div>
            <p>OTP केवल कुछ मिनटों के लिए मान्य है। कृपया शीघ्रता से उपयोग करें।</p>
            <p>यदि आपने यह अनुरोध नहीं किया है, तो इस ईमेल को अनदेखा करें।</p>
            <hr />
            <p style="font-size: 12px; color: #888;">यह एक स्वचालित ईमेल है। उत्तर न दें।</p>
            <p style="font-size: 12px; color: #888;">समर्थन के लिए संपर्क करें: 
              <a href="mailto:support@skjbmd.org" style="color: #8B0000;">support@skjbmd.org</a>
            </p>
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
