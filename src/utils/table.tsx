import BigNumber from 'bignumber.js'
import { addDays, addHours, addMinutes, formatWithOptions, subDays, subHours } from 'date-fns/fp'
import { enUS } from 'date-fns/locale'
import differenceInMinutes from 'date-fns/differenceInMinutes'
import differenceInHours from 'date-fns/differenceInHours'
import differenceInDays from 'date-fns/differenceInDays'

// @TODO: verify this colouring
export const getHealthFactorState = (hf: BigNumber): 'ok' | 'warning' | 'danger' => {
  return hf.gte(1.5) ? 'ok' : hf.gt(1.05) ? 'warning' : 'danger'
}

// curried version
export const parseDate = formatWithOptions({ locale: enUS }, 'MM/dd/yyyy')

export const parseTime = formatWithOptions({ locale: enUS }, 'hh:mm:ss b')

export const remainingTime = (d: Date) => {
  if (d.getTime() <= Date.now()) {
    return 'Expired'
  }
  let today = new Date()
  const diffInDays = differenceInDays(d, today)
  today = addDays(diffInDays, today)
  const diffInHours = differenceInHours(d, today)
  today = addHours(diffInHours, today)
  const diffInMinutes = differenceInMinutes(d, today)
  today = addMinutes(diffInMinutes, today)
  return `${diffInDays}d:${diffInHours}h:${diffInMinutes}m`
}

export const elapsedTime = (d: Date) => {
  let today = new Date()
  const diffInDays = differenceInDays(today, d)
  today = subDays(diffInDays, today)
  const diffInHours = differenceInHours(today, d)
  today = subHours(diffInHours, today)
  const diffInMinutes = differenceInMinutes(today, d)
  return `${diffInDays}d:${diffInHours}h:${diffInMinutes}m ago`
}

export const tablePagination = (total: number | undefined): any => {
  return {
    total: total,
    pageSize: 10,
    current: 1,
    position: ['bottomCenter'],
    showTotal: (total: number, [from, to]: [number, number]) => (
      <>
        Showing results {from} to {to} of {total}
      </>
    ),
  }
}
