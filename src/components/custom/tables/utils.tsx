import BigNumber from 'bignumber.js'
import { addDays, addHours, addMinutes, formatWithOptions } from 'date-fns/fp'
import { enUS } from 'date-fns/locale'
import differenceInMinutes from 'date-fns/differenceInMinutes'
import differenceInHours from 'date-fns/differenceInHours'
import differenceInDays from 'date-fns/differenceInDays'

const calculateHealthFactor = (hf: BigNumber): 'danger' | 'ok' | 'warning' => {
  return hf.gte(4.0) ? 'ok' : hf.gte(1.0) ? 'warning' : 'danger'
}

// curried version
const parseDate = formatWithOptions({ locale: enUS }, 'MM/dd/yyyy')

const remainingTime = (d: Date) => {
  let today = new Date()
  const diffInDays = differenceInDays(d, today)
  today = addDays(diffInDays, today)
  const diffInHours = differenceInHours(d, today)
  today = addHours(diffInHours, today)
  const diffInMinutes = differenceInMinutes(d, today)
  today = addMinutes(diffInMinutes, today)
  return `${diffInDays}d:${diffInHours}h:${diffInMinutes}m`
}

export { calculateHealthFactor, parseDate, remainingTime }
