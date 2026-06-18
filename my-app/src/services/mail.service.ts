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
    },

    sendEmailPasswordRecovery: (email: string, token: string) => {
        const link = `${process.env.FRONT_URL}/reset-password?token=${token}`

        return transporter.sendMail({
            from: '"Soporte" <no-reply@app.com>',
            to: email,
            subject: 'Restablecer contraseña',
            html: `
    <p>Hacé click para restablecer tu contraseña:</p>
    <a href="${link}">${link}</a>
`
        })
    },

    sendPasswordChangedEmail: (email: string) => {
        return transporter.sendMail({
            from: '"Soporte" <no-reply@app.com>',
            to: email,
            subject: 'Contraseña actualizada',
            html: `
            <p>Hola,</p>

            <p>Te confirmamos que la contraseña de tu cuenta fue actualizada correctamente.</p>

            <p>Si realizaste este cambio, no es necesario que hagas nada más.</p>

            <p><strong>Si no reconocés esta actividad, te recomendamos contactar con soporte lo antes posible.</strong></p>
        `
        })
    }

}