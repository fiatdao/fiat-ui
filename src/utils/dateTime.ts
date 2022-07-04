import { Maybe } from '@/types/utils'
import { formatWithOptions } from 'date-fns/fp'
import { enUS } from 'date-fns/locale'

const DATE_FORMAT = 'PP'

const parseDate = formatWithOptions({ locale: enUS }, DATE_FORMAT)

const stringToDateOrCurrent = (ts?: Maybe<string>): Date => {
  return new Date(ts ? +ts * 1000 : Date.now())
}

export { parseDate, stringToDateOrCurrent }
