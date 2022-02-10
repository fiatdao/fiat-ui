import { Button } from 'antd'
import Link from 'next/link'
import genericSuspense from '@/src/utils/genericSuspense'

const OpenPosition = () => {
  return (
    <>
      {/* TODO: implement dynamic titles */}
      {/*<Header title={`Open ${tokenSymbol} position`} />*/}
      <Link href="/auctions" passHref>
        <Button>Back</Button>
      </Link>
    </>
  )
}

export default genericSuspense(OpenPosition)
