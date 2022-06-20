import { Maybe } from '@/types/utils'
import { addDays, addHours, addMinutes, formatWithOptions } from 'date-fns/fp'
import { enUS } from 'date-fns/locale'
import differenceInMinutes from 'date-fns/differenceInMinutes'
import differenceInHours from 'date-fns/differenceInHours'
import differenceInDays from 'date-fns/differenceInDays'

const DATE_FORMAT = 'PP'

const parseDate = formatWithOptions({ locale: enUS }, DATE_FORMAT)

const remainingTime = (d: Date | null): string => {
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

const stringToDateOrCurrent = (ts?: Maybe<string>): Date => {
  return new Date(ts ? +ts * 1000 : Date.now())
}

export { parseDate, remainingTime, stringToDateOrCurrent }
