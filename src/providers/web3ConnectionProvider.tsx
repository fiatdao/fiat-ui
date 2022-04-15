import {
  Dispatch,
  ReactElement,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers'
import Onboard from 'bnc-onboard'
import { API, Wallet } from 'bnc-onboard/dist/src/interfaces'
import { Subscriptions } from 'bnc-onboard/dist/src/interfaces'
import { RPC_URL_GOERLI } from '@/src/constants/misc'
import {
  Chains,
  ChainsValues,
  INITIAL_APP_CHAIN_ID,
  chainsConfig,
  getNetworkConfig,
  isValidChain,
} from '@/src/constants/chains'
import isServer from '@/src/utils/isServer'
import { RequiredNonNull } from '@/types/utils'

const STORAGE_CONNECTED_WALLET = 'onboard_selectedWallet'
// give onboard a window to update its internal state after certain actions
const ONBOARD_STATE_DELAY = 100

// @TODO: Default VALUES to connect to multiple wallets
const PORTIS_KEY = 'Your Portis key here'
const APP_URL = 'Your app url here'
const CONTACT_EMAIL = 'Your contact email here'
const RPC_URL = 'https://<network>.infura.io/v3/<INFURA_KEY>'

export enum WalletType {
  MetaMask = 'metamask',
  Ledger = 'ledger',
  Portis = 'portis',
  Trezor = 'trezor',
  Coinbase = 'coinbase',
  WalletConnect = 'walletConnect',
}

// Instantiate WalletConnect
let onboard: API | null = null
function initOnboard(appChainId: ChainsValues, subscriptions: Subscriptions) {
  if (isServer()) {
    return
  }

  if (onboard !== null) {
    return
  }

  window.onboard = Onboard({
    networkId: appChainId,
    networkName: getNetworkConfig(appChainId)?.name,
    hideBranding: true,
    darkMode: true, // @TODO: it is a default value
    walletSelect: {
      heading: 'Select a Wallet',
      description: 'Pick a wallet to connect to FIAT DAO',
      wallets: [
        {
          walletName: WalletType.MetaMask,
          preferred: true,
        },
        {
          walletName: WalletType.Ledger,
          rpcUrl: RPC_URL,
          preferred: true,
        },
        {
          walletName: WalletType.Portis,
          apiKey: PORTIS_KEY,
          preferred: true,
          // label: 'Login with Email'
        },
        {
          walletName: WalletType.Trezor,
          appUrl: APP_URL,
          email: CONTACT_EMAIL,
          rpcUrl: RPC_URL,
          preferred: true,
        },
        {
          walletName: WalletType.Coinbase,
          preferred: true,
        },
        {
          walletName: WalletType.WalletConnect,
          preferred: true,
          rpc: Object.values(chainsConfig).reduce(
            (rpc, val) => ({
              ...rpc,
              [val.chainId]: val.rpcUrl,
            }),
            {},
          ),
        },
      ],
    },
    subscriptions: subscriptions,
    walletCheck: [
      { checkName: 'derivationPath' },
      { checkName: 'accounts' },
      { checkName: 'connect' },
    ],
  })

  onboard = window.onboard
}

export type Web3Context = {
  address: string | null
  appChainId: ChainsValues
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  isAppConnected: boolean
  isWalletConnected: boolean
  isWalletNetworkSupported: boolean
  readOnlyAppProvider: JsonRpcProvider
  wallet: Wallet | null
  walletChainId: number | null
  web3Provider: Web3Provider | null
  getExplorerUrlForTxHash: (hash: string) => string
  changeNetworkModalOpen: boolean
  setChangeNetworkModalOpen: Dispatch<SetStateAction<Web3Context['changeNetworkModalOpen']>>
  setNetwork: (chainId: ChainsValues) => void
}

const Web3ContextConnection = createContext<Web3Context | undefined>(undefined)

type Props = {
  fallback: ReactElement
  children: ReactNode
}

export default function Web3ConnectionProvider({ children, fallback }: Props) {
  const [isInitializing, setIsInitializing] = useState(true)
  const [address, setAddress] = useState<string | null>(null)
  const [walletChainId, setWalletChainId] = useState<ChainsValues | null>(null)
  const [tmpWallet, setTmpWallet] = useState<Wallet | null>(null)
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [validNetwork, setValidNetwork] = useState<boolean>(false)
  const [changeNetworkModalOpen, setChangeNetworkModalOpen] = useState(false)
  const supportedChainIds = Object.values(Chains)

  const web3Provider = wallet?.provider ? new Web3Provider(wallet.provider) : null

  const isWalletConnected = web3Provider != null && address != null && validNetwork

  const appChainId = walletChainId ?? INITIAL_APP_CHAIN_ID

  const isAppConnected = isWalletConnected && walletChainId === appChainId

  const isWalletNetworkSupported = supportedChainIds.includes(walletChainId as any)

  // if no config exists for the given appChainId, fall back to a default RPC
  const rpcUrl = getNetworkConfig(appChainId)?.rpcUrl ?? RPC_URL_GOERLI

  // Ignore the linter warning about `rpcUrl` dependency -
  // `rpcUrl` is already dependent on `appChainId`, so we don't need rpcUrl in the dependencies list
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const readOnlyAppProvider = useMemo(() => new JsonRpcProvider(rpcUrl, appChainId), [appChainId])

  const _reconnectWallet = async (): Promise<void> => {
    if (!onboard) {
      console.warn('Unable to connect, onboard is not defined')
      return
    }

    const previouslySelectedWallet = window.localStorage.getItem(STORAGE_CONNECTED_WALLET)

    if (previouslySelectedWallet) {
      await onboard.walletSelect(previouslySelectedWallet)
    }
  }

  useEffect(() => {
    const t = setTimeout(() => {
      setIsInitializing(false)
    }, 500)
    return () => {
      clearTimeout(t)
    }
  }, [])

  // Instantiate Onboard
  useEffect(() => {
    initOnboard(INITIAL_APP_CHAIN_ID, {
      network: (network) => {
        setWalletChainId((network as ChainsValues) || null)
      },
      address: async (address) => {
        setAddress(address || null)
      },
      wallet: async (wallet) => {
        if (wallet.name === undefined) {
          setWallet(null)
          setTmpWallet(null)
        } else {
          setTmpWallet(wallet)
        }
      },
    })
  }, [])

  // recover previous connection
  useEffect(() => {
    setTimeout(async () => {
      await _reconnectWallet()
    }, ONBOARD_STATE_DELAY)
  }, [])

  useEffect(() => {
    setValidNetwork(isValidChain(walletChainId))
    if (!isValidChain(walletChainId) && walletChainId !== null) {
      setChangeNetworkModalOpen(true)
    }
  }, [walletChainId])

  // efectively connect wallet
  useEffect(() => {
    if (!address || !tmpWallet) {
      return
    }

    const connectWallet = async () => {
      const appIsReady = await onboard?.walletCheck()

      const connectedWallet = tmpWallet
      if (appIsReady && connectedWallet) {
        window.localStorage.setItem(STORAGE_CONNECTED_WALLET, connectedWallet.name || '')
        setWallet(connectedWallet)
        setTmpWallet(null)
      }
    }

    connectWallet()
  }, [tmpWallet, address])

  const disconnectWallet = () => {
    if (!onboard) {
      console.warn('Unable to connect, onboard is not defined')
      return
    }
    onboard.walletReset()
    setValidNetwork(false)
    window.localStorage.removeItem(STORAGE_CONNECTED_WALLET)
  }

  const connectWallet = async (): Promise<void> => {
    if (!onboard) {
      console.warn('Unable to connect, onboard is not defined')
      return
    }
    if (await onboard.walletSelect()) {
      const isWalletCheck = await onboard.walletCheck()
      if (isWalletCheck) {
        const { address, network } = onboard.getState()
        if (isValidChain(network)) {
          setAddress(address)
          setValidNetwork(true)
        } else {
          setChangeNetworkModalOpen(true)
          setValidNetwork(false)
        }
      }
    }
  }

  const setNetwork = async (chainId: ChainsValues) => {
    const networkConfig = getNetworkConfig(chainId)
    if (networkConfig === undefined) {
      setChangeNetworkModalOpen(true)
      setValidNetwork(false)
    } else {
      // Prompt user through MetaMask to switch to a supported chain OR add the chain to their wallet if they don't have it yet
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [
            {
              chainId: networkConfig.chainIdHex,
            },
          ],
        })
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask.
        if ((switchError as { code: number }).code === 4902) {
          try {
            const addNetworkConfig = {
              chainId: networkConfig.chainIdHex,
              chainName: networkConfig.name,
              rpcUrls: [networkConfig.rpcUrl],
              blockExplorerUrls: networkConfig.blockExplorerUrls,
              iconUrls: networkConfig.iconUrls,
            }

            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [addNetworkConfig],
            })
          } catch (addError) {
            console.error('Error adding network: ', addError)
          }
        } else {
          console.error('Switch error: ', switchError)
        }
      }
    }
  }

  const getExplorerUrlForTxHash = useMemo(() => {
    const url = chainsConfig[appChainId]?.blockExplorerUrls[0]
    return (hash: string) => {
      const type = hash.length > 42 ? 'tx' : 'address'
      return `${url}${type}/${hash}`
    }
  }, [appChainId])

  const value = {
    // true when wallet is connected to same network as the dapp
    isAppConnected,
    isWalletConnected,
    isWalletNetworkSupported,
    appChainId,
    wallet,
    walletChainId,
    address,
    readOnlyAppProvider,
    web3Provider,
    getExplorerUrlForTxHash,
    connectWallet,
    disconnectWallet,
    changeNetworkModalOpen,
    setChangeNetworkModalOpen,
    setNetwork,
  }

  if (isInitializing) {
    return fallback
  }

  return <Web3ContextConnection.Provider value={value}>{children}</Web3ContextConnection.Provider>
}

export function useWeb3Connection() {
  const context = useContext(Web3ContextConnection)
  if (context === undefined) {
    throw new Error('useWeb3Connection must be used within a Web3ConnectionProvider')
  }
  return context
}

type Web3ConnectedContext = RequiredNonNull<Web3Context>

export function useWeb3Connected() {
  const context = useWeb3Connection()
  if (!context.isWalletConnected) {
    throw new Error('useWeb3Connected must be used within a connected context')
  }
  return context as Web3ConnectedContext
}
