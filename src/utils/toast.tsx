import { toast } from 'react-toastify'
import { ReactNode } from 'react'

import { Error } from '@/src/components/assets/Error'
import { Warning } from '@/src/components/assets/Warning'
import { Success } from '@/src/components/assets/Success'
import { Spinner } from '@/src/components/common/Spinner'

export const toastSuccess = (message: string | ReactNode) =>
  toast.success(message, {
    icon: <Success />,
  })

export const toastError = (message: string | ReactNode) =>
  toast.error(message, {
    icon: <Error />,
  })

export const toastWarning = (message: string | ReactNode) =>
  toast.warning(message, {
    icon: <Warning />,
  })

export const toastWorking = (message: string | ReactNode, autoClose?: number | false | undefined) =>
  toast.info(message, {
    icon: <Spinner size="extraSmall" />,
    hideProgressBar: true,
    autoClose,
  })

export const toastInfo = (message: string | ReactNode) =>
  toast.info(message, {
    icon: false,
    hideProgressBar: true,
  })
