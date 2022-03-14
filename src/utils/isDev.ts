export default function isDev(): boolean {
  return (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'development' ||
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview'
  )
}
