
"use client"

import { Dispatch, SetStateAction, useState } from "react"
import { ComplaintReason } from "@prisma/client"
import { useForm } from "react-hook-form"
import { ComplaintRegisterSchema } from "@/lib/schemas/complaint/complaint.create.schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { jobsApi } from "@/lib/api/jobs/jobs"
import styles from "./ReportJobForm.module.css"

export type ComplaintRegisterDto = z.infer<
    typeof ComplaintRegisterSchema
>

type ReportJobFormProps = {
    setHide: Dispatch<SetStateAction<boolean>>
    setReported: Dispatch<SetStateAction<boolean | undefined>>
    jobId: number
    setServerError: Dispatch<
        SetStateAction<{ status: number, message: string } | undefined>
    >
}

const ReportJobForm = ({
    setHide,
    jobId,
    setReported,
    setServerError
}: ReportJobFormProps) => {

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm<ComplaintRegisterDto>({
        resolver: zodResolver(ComplaintRegisterSchema),
        defaultValues: {},
        shouldUnregister: true
    })

    const [sending, setSending] = useState<boolean>(false)
    const [message, setMessage] = useState<string>("")
    const [showExplanation, setShowExplanation] = useState(false)

    const selectedReason = watch("reason")

    const complaintReasonLabels: Record<
        ComplaintRegisterDto["reason"],
        string
    > = {
        FALSE_INFORMATION: "Publicación falsa o engañosa",
        SUSPECTED_SCAM: "Posible estafa o solicitud sospechosa",
        INCORRECT_INFORMATION: "Información incorrecta o incompleta",
        INAPPROPRIATE_CONTENT: "Contenido inapropiado",
        DUPLICATE_OR_SPAM: "Publicación duplicada o spam",
        IMPERSONATION: "Suplantación de identidad",
        OTHER: "Otro motivo"
    }

    const handleComplaintCreate = async (data: ComplaintRegisterDto) => {
        try {
            setSending(true)
            setMessage("")

            const res = await jobsApi.reportJob(jobId, data)

            if (res.ok) {
                setReported(true)
                setMessage("Denuncia realizada!")

                await new Promise(resolve => setTimeout(resolve, 1800))

                setHide(false)
                return
            } else {
                setServerError({
                    status: res.status,
                    message: res.error
                })
                return
            }

        } catch {
            setServerError({
                status: 0,
                message: "No se pudo conectar con el servidor. Intentá nuevamente."
            })
        } finally {
            setSending(false)
        }
    }

    if (message) {
        return (
            <div className={styles.reportSuccess}>
                <h2>{message}</h2>
            </div>
        )
    }

    return (
        <section className={styles.reportContainer}>

            <div className={styles.reportHeader} />

            <div className={styles.reportContent}>

                <h2 className={styles.reportTitle}>
                    Hacé tu denuncia
                </h2>

                <form
                    className={styles.reportForm}
                    onSubmit={handleSubmit(handleComplaintCreate)}
                >

                    {/* Options */}
                    <div className={styles.reasonGroup}>

                        {Object.values(ComplaintReason).map((reason) => (
                            <label
                                key={reason}
                                className={styles.reasonOption}
                            >
                                <input
                                    type="radio"
                                    value={reason}
                                    {...register("reason")}
                                />

                                <span>{complaintReasonLabels[reason]}</span>
                            </label>
                        ))}

                    </div>

                    {errors.reason?.message && (
                        <p className={styles.inputError}>
                            {errors.reason.message}
                        </p>
                    )}

                    {/* Optional explanation */}
                    {selectedReason !== ComplaintReason.OTHER && (
                        <label className={styles.extraDetails}>
                            <input
                                type="checkbox"
                                checked={showExplanation}
                                onChange={(e) =>
                                    setShowExplanation(e.target.checked)
                                }
                            />

                            <span>Quiero agregar más detalles</span>
                        </label>
                    )}

                    {/* Explanation */}
                    {(selectedReason === ComplaintReason.OTHER ||
                        showExplanation) && (
                        <div className={styles.explanationGroup}>

                            <textarea
                                className={styles.explanationInput}
                                placeholder="Escribí los detalles de tu denuncia..."
                                {...register("explanation")}
                            />

                            {errors.explanation?.message && (
                                <p className={styles.inputError}>
                                    {errors.explanation.message}
                                </p>
                            )}

                        </div>
                    )}

                    {/* Buttons */}
                    {!sending ? (
                        <div className={styles.reportActions}>

                            <button type="submit">
                                Enviar
                            </button>

                            <button
                                type="button"
                                onClick={() => setHide(false)}
                            >
                                Volver
                            </button>

                        </div>
                    ) : (
                        <p className={styles.loading}>
                            Enviando...
                        </p>
                    )}

                </form>

            </div>

        </section>
    )
}

export default ReportJobForm
