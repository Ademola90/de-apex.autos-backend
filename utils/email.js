// auth-service/utils/email.js
import nodemailer from "nodemailer";

export const sendOTPEmail = async (email, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP code is: ${otp}. It will expire in 1 hour.`,
        };

        await transporter.sendMail(mailOptions);
        return { status: true, message: "OTP email sent successfully" };
    } catch (error) {
        console.error("Error sending OTP email:", error.message);
        return { status: false, message: "Failed to send OTP email" };
    }
};



// import nodemailer from "nodemailer";

// export const sendVerificationEmail = async (to, verificationLink) => {
//     const transporter = nodemailer.createTransport({
//         host: process.env.SMTP_HOST,
//         port: process.env.SMTP_PORT,
//         secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
//         auth: {
//             user: process.env.SMTP_USER,
//             pass: process.env.SMTP_PASS,
//         },
//     });

//     const mailOptions = {
//         from: `"Your App Name" <${process.env.SMTP_USER}>`,
//         to,
//         subject: "Email Verification",
//         html: `<p>Please verify your email by clicking the link below:</p>
//                <a href="${verificationLink}">Verify Email</a>`,
//     };

//     try {
//         await transporter.sendMail(mailOptions);
//     } catch (error) {
//         console.error("Email sending error:", error);
//         throw new Error(`Email sending error: ${error.message}`);
//     }
// };


// // auth-service/utils/email.js
// import nodemailer from "nodemailer";

// export const sendOTPEmail = async (email, otp) => {
//     try {
//         const transporter = nodemailer.createTransport({
//             service: "gmail",
//             auth: {
//                 user: process.env.EMAIL,
//                 pass: process.env.EMAIL_PASSWORD,
//             },
//         });

//         const mailOptions = {
//             from: process.env.EMAIL,
//             to: email,
//             subject: "Your OTP Code",
//             text: `Your OTP code is: ${otp}. It will expire in 1 hour.`,
//         };

//         await transporter.sendMail(mailOptions);
//         return { status: true, message: "OTP email sent successfully" };
//     } catch (error) {
//         console.error("Error sending OTP email:", error.message);
//         return { status: false, message: "Failed to send OTP email" };
//     }
// };




// import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//     service: "Gmail", // Or another email provider
//     auth: {
//         user: process.env.EMAIL, // Your email
//         pass: process.env.EMAIL_PASSWORD, // Your email password
//     },
// });

// export const sendVerificationEmail = (to, link) => {
//     const mailOptions = {
//         from: process.env.EMAIL,
//         to,
//         subject: "Verify Your Email",
//         html: `<p>Please verify your email by clicking <a href="${link}">here</a>.</p>`,
//     };

//     return transporter.sendMail(mailOptions);
// };
