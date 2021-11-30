import { toastError, toastSuccess } from '../utils/toast'
import { ReactText, useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'

import axios from 'axios'

import { API_URL } from '@/src/constants/misc'

type Props = {
  signature: string | null
}
export default function ResendEmail({ signature }: Props) {
  const [resendEnabled, setResendEnabled] = useState(true)
  const toastId = useRef<ReactText | undefined>(undefined)

  const resendEmail = async () => {
    toast.dismiss(toastId.current)
    try {
      await axios.post(
        `${API_URL}${'/users/resend_verification_email'}`,
        {},
        {
          headers: { authorization: signature },
        },
      )
      setResendEnabled(false)
      toastId.current = toastSuccess('Email sent successfully.')
    } catch (error) {
      toastId.current = toastError('There was an error sending the email.')
    }
  }

  useEffect(() => {
    if (resendEnabled) {
      return
    }

    const timeout = setTimeout(() => {
      setResendEnabled(true)
    }, 10_000)

    return () => {
      clearTimeout(timeout)
    }
  }, [resendEnabled])

  return (
    <>
      <p>
        We have sent you an email, open it and verify your account to participate in the raffle.
      </p>
      <p>
        <button disabled={!resendEnabled} onClick={resendEmail}>
          re-send email
        </button>
      </p>
    </>
  )
}
