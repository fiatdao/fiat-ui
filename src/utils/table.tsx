import BigNumber from 'bignumber.js'
import { addDays, addHours, addMinutes, formatWithOptions } from 'date-fns/fp'
import { enUS } from 'date-fns/locale'
import differenceInMinutes from 'date-fns/differenceInMinutes'
import differenceInHours from 'date-fns/differenceInHours'
import differenceInDays from 'date-fns/differenceInDays'

export const calculateHealthFactor = (hf: BigNumber): 'danger' | 'ok' | 'warning' => {
  return hf.gte(2.5) ? 'ok' : hf.gte(1.5) ? 'warning' : 'danger'
}

// curried version
export const parseDate = formatWithOptions({ locale: enUS }, 'MM/dd/yyyy')

export const remainingTime = (d: Date) => {
  let today = new Date()
  const diffInDays = differenceInDays(d, today)
  today = addDays(diffInDays, today)
  const diffInHours = differenceInHours(d, today)
  today = addHours(diffInHours, today)
  const diffInMinutes = differenceInMinutes(d, today)
  today = addMinutes(diffInMinutes, today)
  return `${diffInDays}d:${diffInHours}h:${diffInMinutes}m`
}

export const tablePagination = (total: number | undefined): any => {
  return {
    total: total,
    pageSize: 10,
    current: 1,
    position: ['bottomCenter'],
    showTotal: (total: number, [from, to]: [number, number]) => (
      <>
        Showing {from} to {to} of the most recent {total}
      </>
    ),
  }
}
