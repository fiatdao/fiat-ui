import { FallbackProps } from 'react-error-boundary'

export const GeneralError = ({ error }: FallbackProps) => {
  return (
    <div>
      {/* <InfoIcon /> */}
      <h1>There was an error</h1>
      <pre>{JSON.stringify(error, null, 2)}</pre>
    </div>
  )
}
