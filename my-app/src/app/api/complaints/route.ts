import requireSession from "@/domain/auth/requireSession";
import errorHandler from "@/lib/errors/errorHandler";
import { PageSchema } from "@/lib/schemas/page.Schema";
import { complaintService } from "@/services/complaint.service";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    try {
        const userId = await requireSession()

        const searchParams = req.nextUrl.searchParams

        const validation = PageSchema.safeParse({
            page: searchParams.get("page") ?? undefined
        })

        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error },
                { status: 400 }
            )
        }

        const page = validation.data.page

        const { complaints, hasNextPage } = await complaintService.getAllActiveComplaints(userId, page)
        return NextResponse.json({ ok: true, complaints, hasNextPage }, { status: 200 })
    } catch (error) {
        return errorHandler(error)
    }
}