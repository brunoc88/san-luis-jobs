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
    },

    sendJobSuspendedEmail: (
        email: string,
        jobTitle: string,
        reason: string
    ) => {
        return transporter.sendMail({
            from: '"Soporte" <no-reply@app.com>',
            to: email,
            subject: 'Publicación suspendida',
            html: `
            <p>Hola,</p>

            <p>Te informamos que tu publicación <strong>"${jobTitle}"</strong> fue suspendida por incumplir las normas de la plataforma.</p>

            <p><strong>Motivo:</strong></p>
            <p>${reason}</p>

            <p>Esta advertencia quedará registrada en tu cuenta.</p>

            <p>Si considerás que se trata de un error, podés comunicarte con el equipo de soporte para solicitar una revisión.</p>

            <p>Saludos,<br>Equipo de San Luis Jobs.</p>
        `
        })
    },

    sendAccountSuspendedEmail: (email: string) => {
        return transporter.sendMail({
            from: '"Soporte" <no-reply@app.com>',
            to: email,
            subject: 'Cuenta suspendida',
            html: `
            <p>Hola,</p>

            <p>Tu cuenta ha sido suspendida debido a la acumulación de advertencias por incumplimiento de las normas de la plataforma.</p>

            <p>Mientras la suspensión permanezca activa no podrás acceder a tu cuenta ni publicar nuevas ofertas de empleo.</p>

            <p>Si considerás que se trata de un error, podés comunicarte con el equipo de soporte para solicitar una revisión.</p>

            <p>Saludos,<br>Equipo de San Luis Jobs.</p>
        `
        })
    },

    sendApplicationEmail: (
        authorEmail: string,
        applicantEmail: string,
        jobTitle: string,
        cvUrl: string
    ) => {
        return transporter.sendMail({
            from: '"San Luis Jobs" <no-reply@app.com>',
            to: authorEmail,
            subject: "Nueva postulación recibida",
            html: `
            <p>Hola,</p>

            <p>Has recibido una nueva postulación para tu publicación:</p>

            <p><strong>${jobTitle}</strong></p>

            <p><strong>Email del postulante:</strong> ${applicantEmail}</p>

            <p>Puedes descargar su CV desde el siguiente enlace:</p>

            <p><a href="${cvUrl}">Descargar CV</a></p>

            <p>Saludos,<br>Equipo de San Luis Jobs.</p>
        `
        })
    },

    sendSuspendedAccountActivatedEmail: (email: string) => {
        return transporter.sendMail({
            from: '"Soporte" <no-reply@app.com>',
            to: email,
            subject: 'Cuenta reactivada',
            html: `
            <h2>Tu cuenta ha sido reactivada</h2>

            <p>
                Te informamos que tu cuenta ha sido reactivada correctamente.
            </p>

            <p>
                Las suspensiones asociadas a tu cuenta han sido levantadas
                y ya podés volver a utilizar la plataforma con normalidad.
            </p>

            <p>
                Recordá respetar las normas de la plataforma para evitar
                nuevas sanciones.
            </p>

            <p>
                Saludos,<br>
                Equipo de Soporte
            </p>
        `
        })
    }
}