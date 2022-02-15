import { useRouter } from 'next/router'

export const useQueryParam = (param: string) => {
  const {
    query: { [param]: value },
  } = useRouter()

  return value
}
