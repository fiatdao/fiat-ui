import { Button } from 'antd'
import Link from 'next/link'
import { Header } from '@/src/components/custom/header'
import { useTokenSymbol } from '@/src/hooks/contracts/useTokenSymbol'
import genericSuspense from '@/src/utils/genericSuspense'

const PositionManager = () => {
  const { tokenAddress, tokenSymbol } = useTokenSymbol()

  return (
    <>
      <Header title={`Open ${tokenSymbol} position`} />
      <Link href="/open-position" passHref>
        <Button>Back</Button>
      </Link>
      <h1>Open: {tokenAddress}</h1>
    </>
  )
}

export default genericSuspense(PositionManager)
