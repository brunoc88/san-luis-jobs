import {beforeEach, afterAll, it, describe } from "vitest"
import { mailService } from "@/services/mail.service"

it('Probando sendEmailVerification', async () => {
    const res = await mailService.sendEmailVerification('test1@gmail.com','123123')
    console.log('respond', res)
})
