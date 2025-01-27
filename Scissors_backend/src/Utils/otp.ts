import nodemailer from 'nodemailer'

export const generateOtp = ():string=>{
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export const sendOtpEmail = async(email:string,otp:string):Promise<void>=>{
    const transporter = nodemailer.createTransport({
        service:"Gmail",
        auth:{
            user:process.env.EMAIL,
            pass:process.env.EMAIL_PASS
        },
        tls:{
            rejectUnauthorized:false
        }
    });

    const mailOptions = {
        from:process.env.EMAIL,
        to:email,
        subject:"Your OTP for Password Reset",
        text:`Your OTP is ${otp}.It will expires in One minute`
    }

    await transporter.sendMail(mailOptions);
}