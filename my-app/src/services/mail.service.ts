import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
})

export const mailService = {
    sendEmailVerification: (email: string, token: string) => {
        const link = `${process.env.FRONT_URL}/confirm?token=${token}`

        return transporter.sendMail({
            from: '"Soporte" <no-reply@app.com>',
            to: email,
            subject: 'Confirmacion de cuenta',
            html: `
        <p>Hacé click para confirmar tu cuenta:</p>
        <a href="${link}">${link}</a>
      `
        })
    }
}