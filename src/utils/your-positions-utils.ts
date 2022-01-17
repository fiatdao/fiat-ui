import { addDays, addHours, addMinutes, formatWithOptions } from 'date-fns/fp'
import { enUS } from 'date-fns/locale'
import differenceInMinutes from 'date-fns/differenceInMinutes'
import differenceInHours from 'date-fns/differenceInHours'
import differenceInDays from 'date-fns/differenceInDays'

const healthFactor = (hf: number) => {
  if (hf > 4.0) {
    return 'green'
  }
  if (hf > 1.0) {
    return 'orange'
  }
  return 'red'
}

// curried version
const parseDate = formatWithOptions({ locale: enUS }, 'MM/dd/yyyy')

const remainingTime = (d: Date | null) => {
  if (!d) return ''

  let today = new Date()
  const diffInDays = differenceInDays(d, today)
  today = addDays(diffInDays, today)
  const diffInHours = differenceInHours(d, today)
  today = addHours(diffInHours, today)
  const diffInMinutes = differenceInMinutes(d, today)
  today = addMinutes(diffInMinutes, today)
  return `${diffInDays}d:${diffInHours}h:${diffInMinutes}m`
}

export { healthFactor, parseDate, remainingTime }
