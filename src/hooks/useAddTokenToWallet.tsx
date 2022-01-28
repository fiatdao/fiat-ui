import { useCallback, useState } from 'react'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'

interface Params {
  address: string
  decimals: number
  image: string
  symbol: string
}

export default function useAddTokenToWallet({ address, decimals, image, symbol }: Params) {
  const { web3Provider } = useWeb3Connection()
  const [status, setStatus] = useState('idle')

  const addToken = useCallback(() => {
    // There is an error with the request promise... check this: https://github.com/MetaMask/metamask-extension/issues/11377#issuecomment-1012051419

    if (!web3Provider?.provider) {
      return setStatus('missing_web3_provider')
    }
    setStatus('pending')

    // @ts-ignore
    web3Provider.provider
      .request({
        method: 'wallet_watchAsset',
        params: {
          // @ts-ignore TODO types
          type: 'ERC20',
          options: {
            address,
            symbol,
            decimals,
            image,
          },
        },
      })
      .then((success) => {
        if (success) setStatus('success')
        else setStatus('error')
      })
  }, [address, decimals, image, symbol, web3Provider])

  return { addToken, status }
}
