import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export const loadComplaints = async () => {
  const users = await prisma.user.findMany({
    select: { id: true }
  })

  const jobs = await prisma.job.findMany({
    select: { id: true }
  })

  const complaints : Prisma.ComplaintCreateManyInput[] = [
    { userId: users[0].id, jobId: jobs[0].id, reason: "FALSE_INFORMATION", explanation: "La descripción del puesto contiene información que no coincide con la oferta real." },
    { userId: users[1].id, jobId: jobs[0].id, reason: "SUSPECTED_SCAM", explanation: "Solicitan datos personales que no parecen necesarios para postularse." },
    { userId: users[2].id, jobId: jobs[1].id, reason: "INCORRECT_INFORMATION", explanation: "La modalidad publicada no coincide con la que informa la empresa." },
    { userId: users[3].id, jobId: jobs[1].id, reason: "INAPPROPRIATE_CONTENT", explanation: "El contenido de la publicación incluye expresiones inapropiadas." },
    { userId: users[4].id, jobId: jobs[2].id, reason: "DUPLICATE_OR_SPAM", explanation: "Parece ser una publicación duplicada de otra oferta." },
    { userId: users[5].id, jobId: jobs[2].id, reason: "IMPERSONATION", explanation: "El anunciante podría estar utilizando el nombre de otra empresa." },
    { userId: users[6].id, jobId: jobs[3].id, reason: "OTHER", explanation: "La oferta no proporciona información suficiente sobre las tareas." },
    { userId: users[7].id, jobId: jobs[3].id, reason: "FALSE_INFORMATION", explanation: "El salario anunciado parece ser incorrecto." },

    { userId: users[0].id, jobId: jobs[4].id, reason: "INCORRECT_INFORMATION", explanation: "Los requisitos publicados parecen contradictorios." },
    { userId: users[1].id, jobId: jobs[5].id, reason: "SUSPECTED_SCAM", explanation: "Se solicita un pago para continuar con el proceso de selección." },
    { userId: users[2].id, jobId: jobs[6].id, reason: "DUPLICATE_OR_SPAM", explanation: "La misma oferta aparece publicada varias veces." },
    { userId: users[3].id, jobId: jobs[7].id, reason: "OTHER", explanation: "No se especifica claramente la ubicación del empleo." },
    { userId: users[4].id, jobId: jobs[8].id, reason: "FALSE_INFORMATION", explanation: "La experiencia requerida no coincide con el título de la oferta." },
    { userId: users[5].id, jobId: jobs[9].id, reason: "INAPPROPRIATE_CONTENT", explanation: "La publicación contiene comentarios discriminatorios." },
    { userId: users[6].id, jobId: jobs[10].id, reason: "IMPERSONATION", explanation: "No se puede verificar que el anunciante represente a la empresa mencionada." },
    { userId: users[7].id, jobId: jobs[11].id, reason: "INCORRECT_INFORMATION", explanation: "La jornada laboral informada parece ser incorrecta." },

    { userId: users[0].id, jobId: jobs[12].id, reason: "SUSPECTED_SCAM", explanation: "El contacto solicita información bancaria durante la postulación." },
    { userId: users[1].id, jobId: jobs[13].id, reason: "OTHER", explanation: "La oferta no aclara si existe contrato laboral." },
    { userId: users[2].id, jobId: jobs[14].id, reason: "DUPLICATE_OR_SPAM", explanation: "El contenido parece copiado de otra publicación." },
    { userId: users[3].id, jobId: jobs[15].id, reason: "FALSE_INFORMATION", explanation: "La ubicación indicada no coincide con la información de la empresa." },
    { userId: users[4].id, jobId: jobs[16].id, reason: "INCORRECT_INFORMATION", explanation: "El límite de postulantes informado no parece correcto." },
    { userId: users[5].id, jobId: jobs[17].id, reason: "INAPPROPRIATE_CONTENT", explanation: "La publicación incluye contenido que no corresponde a una oferta laboral." },
    { userId: users[6].id, jobId: jobs[18].id, reason: "IMPERSONATION", explanation: "El perfil anunciante podría estar suplantando a una organización." },
    { userId: users[7].id, jobId: jobs[19].id, reason: "OTHER", explanation: "La oferta contiene información incompleta sobre el proceso de selección." }
  ] 

  await prisma.complaint.createMany({
    data: complaints
  })
}

