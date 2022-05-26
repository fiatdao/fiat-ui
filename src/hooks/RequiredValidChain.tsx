import { isValidChain } from '../constants/chains'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'

const withRequiredValidChain = (Component: React.FC) =>
  function Comp(props: any) {
    const { appChainId } = useWeb3Connection()

    if (!isValidChain(appChainId)) return null

    return <Component {...props} />
  }

export default withRequiredValidChain
