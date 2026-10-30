
import { formatDistanceToNow, isToday, isYesterday, parseISO } from "date-fns"
import { es } from "date-fns/locale"

type RelativeDateProps = {
    date: string | Date
}

const RelativeDate = ({ date }: RelativeDateProps) => {
    const parsedDate = date instanceof Date ? date : parseISO(date)

    if (isNaN(parsedDate.getTime())) return null

    if (isToday(parsedDate)) return <span>Hoy</span>
    if (isYesterday(parsedDate)) return <span>Ayer</span>

    return (
        <span>
            {formatDistanceToNow(parsedDate, {
                addSuffix: true,
                locale: es
            })}
        </span>
    )
}

export default RelativeDate
