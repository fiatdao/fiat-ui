import ConnectButton from '@/src/components/custom/connect-button'
import Grid from '@/src/components/custom/grid'

import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import React from 'react'

const withRequiredConnection = (Component: React.FC) =>
  function Comp(props: any) {
    const { address, isWalletConnected } = useWeb3Connection()
    const isConnected = isWalletConnected && address
    if (!isConnected) {
      return (
        // Todo FIXME text and styles
        <Grid align="center" flow="row" justify="center" rowsTemplate="auto">
          <h2 style={{ textAlign: 'center' }}>Wallet is not connected</h2>
          <div style={{ maxWidth: 300, marginTop: 50 }}>
            <ConnectButton />
          </div>
        </Grid>
      )
    }

    return <Component {...props} />
  }

export default withRequiredConnection
