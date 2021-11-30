import { useEffect, useState } from 'react'
import { Block } from '@ethersproject/abstract-provider'

import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'

export default function useCurrentBlock() {
  const [block, setBlock] = useState<Block | null>(null)
  const { address, readOnlyAppProvider } = useWeb3Connection()

  useEffect(() => {
    const getCurrentBlock = async () => {
      const blockNumber = await readOnlyAppProvider.getBlockNumber()
      const currentBlock = await readOnlyAppProvider.getBlock(blockNumber)
      setBlock(currentBlock)
    }
    getCurrentBlock()
  }, [address, readOnlyAppProvider])

  return block
}
