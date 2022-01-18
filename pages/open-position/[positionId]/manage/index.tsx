import { Button } from 'antd'
import Link from 'next/link'
import { useRouter } from 'next/router'
import genericSuspense from '@/src/utils/genericSuspense'

const ManagePosition = () => {
  const {
    query: { positionId: tokenAddress },
  } = useRouter()
  // const { tokenSymbol } = useTokenSymbol(tokenAddress as string)

  return (
    <>
      {/* TODO: implement dynamic titles */}
      {/*<Header title={`${tokenSymbol} Position`} />*/}
      <Link href="/open-position" passHref>
        <Button>Back</Button>
      </Link>
      <h1>Manage: {tokenAddress}</h1>
    </>
  )
}

export default genericSuspense(ManagePosition)
