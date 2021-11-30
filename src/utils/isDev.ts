export default function isDev(): boolean {
  return process.env.NEXT_PUBLIC_REACT_APP_DEFAULT_CHAIN_ID !== '1'
}
