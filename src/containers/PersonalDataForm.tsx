import { ChangeEvent, SyntheticEvent, useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import values from 'lodash/values'
import validateEmail from '@/src/utils/validateEmail'
import { USER, USER_ME } from '@/types/api'

const FormWrapper = styled.form`
  display: flex;
  flex-direction: column;
  width: 300px;
`

const Title = styled.h1`
  font-size: 2.2rem;
  margin: 20px auto 30px;
`

type FormData = { [key in string]: string }
type FormErrors = { [key in string]: string | null }
type Props = {
  user: (USER & USER_ME) | null
  onSubmit: (user: USER) => void
}

export default function PersonalDataForm({ onSubmit, user }: Props) {
  const [formData, setFormData] = useState<FormData>(user ? { ...(user as USER) } : {})
  const [formError, setFormError] = useState<FormErrors>({})

  const isFormEmpty = useCallback(
    () => values(formData).find((value) => !!value) === undefined,
    [formData],
  )

  const isFormValid = () => values(formError).find((value) => !!value) === undefined

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormData((prevData) => ({ ...prevData, [event.target.name]: event.target.value }))
  }

  const handleSubmit = (event: SyntheticEvent) => {
    event.preventDefault()
    if (isFormValid()) {
      onSubmit(formData as USER)
    }
  }

  useEffect(() => {
    const errors: FormErrors = {}

    // prevent rendering errors when form is first initialized
    if (isFormEmpty()) {
      setFormError(errors)
      return
    }

    if (!formData['first_name']) {
      errors['first_name'] = 'Required'
    }

    if (!formData['last_name']) {
      errors['last_name'] = 'Required'
    }

    if (!formData['email']) {
      errors['email'] = 'Required'
    } else if (!validateEmail(formData['email'])) {
      errors['email'] = 'Invalid email'
    }

    setFormError(errors)
  }, [formData, isFormEmpty])

  return (
    <>
      <Title>Raffle Registration</Title>
      <p>Description text</p>
      <FormWrapper onSubmit={handleSubmit}>
        <label htmlFor="first_name">First Name</label>
        <input
          id="first_name"
          name="first_name"
          onChange={handleChange}
          type="text"
          value={formData['first_name']}
        />
        {formError['first_name'] && (
          <label htmlFor="message" style={{ color: 'red' }}>
            {formError['first_name']}
          </label>
        )}

        <label htmlFor="last_name">Last Name</label>
        <input
          id="last_name"
          name="last_name"
          onChange={handleChange}
          type="text"
          value={formData['last_name']}
        />
        {formError['last_name'] && (
          <label htmlFor="message" style={{ color: 'red' }}>
            {formError['last_name']}
          </label>
        )}

        <label htmlFor="email">Email</label>
        <input
          disabled={user?.email_verified}
          id="email"
          name="email"
          onChange={handleChange}
          type="text"
          value={formData['email']}
        />
        {formError['email'] && (
          <label htmlFor="message" style={{ color: 'red' }}>
            {formError['email']}
          </label>
        )}

        <button disabled={!isFormValid()} type="submit">
          Submit
        </button>
      </FormWrapper>
    </>
  )
}
