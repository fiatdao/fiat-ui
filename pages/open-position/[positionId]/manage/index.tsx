import { Button } from 'antd'
import Link from 'next/link'
import { useTokenSymbol } from '@/src/hooks/contracts/useTokenSymbol'
import genericSuspense from '@/src/utils/genericSuspense'
import { Header } from '@/src/components/custom/header'

const PositionManager = () => {
  const { tokenAddress, tokenSymbol } = useTokenSymbol()

  return (
    <>
      <Header title={`${tokenSymbol} Position`} />
      <Link href="/open-position" passHref>
        <Button>Back</Button>
      </Link>
      <h1>Manage: {tokenAddress}</h1>
    </>
  )
}

export default genericSuspense(PositionManager)
