import BigNumber from 'bignumber.js'
import { assign, createMachine } from 'xstate'

export const TITLES_BY_STEP: { [key: number]: { title: string; subtitle: string } } = {
  1: {
    title: 'Configure your position',
    subtitle: 'Select collateral amount to deposit and how much FIAT to mint.',
  },
  2: {
    title: 'Create a Proxy contract',
    subtitle: 'The Proxy Contract will allow you to interact with the FIAT protocol.',
  },
  3: {
    title: 'Set Collateral Allowance',
    subtitle: 'Give permission to the FIAT protocol to manage your collateral.',
  },
  4: {
    title: 'Configure your position',
    subtitle: 'Select collateral amount to deposit and how much FIAT to mint.',
  },
  5: {
    title: 'Confirm your new position',
    subtitle: 'Review and verify the details of your new position.',
  },
}

interface Context {
  erc20Amount: BigNumber
  underlierAmount: BigNumber
  fiatAmount: BigNumber
  currentStepNumber: number
  totalStepNumber: number
  tokenSymbol: string
  tokenAddress: string
  hasAllowance: boolean
  isProxyAvailable: boolean
  loading: boolean
  loadingType: string
}

type Events =
  | { type: 'SET_HAS_ALLOWANCE'; hasAllowance: boolean }
  | { type: 'SET_PROXY_AVAILABLE'; isProxyAvailable: boolean }
  | { type: 'SET_ERC20_AMOUNT'; erc20Amount: BigNumber }
  | { type: 'SET_UNDERLIER_AMOUNT'; underlierAmount: BigNumber }
  | { type: 'SET_FIAT_AMOUNT'; fiatAmount: BigNumber }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'CLICK_SETUP_PROXY' }
  | { type: 'CLICK_ALLOW' }
  | { type: 'CLICK_DEPLOY' }
  | { type: 'CONFIRM' }
  | { type: 'CONFIRMED' }
  | { type: 'FAILED' }
  | { type: 'POSITION_CREATED_SUCCESS' }
  | { type: 'POSITION_CREATED_ERROR' }
  | { type: 'USER_REJECTED' }
  | { type: 'GO_BACK' }

const initialContext: Context = {
  erc20Amount: BigNumber.ZERO,
  underlierAmount: BigNumber.ZERO,
  fiatAmount: BigNumber.ZERO,
  currentStepNumber: 1,
  totalStepNumber: 5,
  tokenSymbol: '',
  tokenAddress: '',
  hasAllowance: false,
  isProxyAvailable: false,
  loading: false,
  loadingType: '',
}
const stepperMachine = createMachine<Context, Events>(
  {
    id: 'stepper',
    initial: 'step-1-enteringERC20Amount',
    context: initialContext,
    on: {
      SET_HAS_ALLOWANCE: {
        actions: 'setAllowance',
        target: 'step-1-enteringERC20Amount',
      },
      SET_PROXY_AVAILABLE: {
        actions: 'setProxyAvailable',
        target: 'step-1-enteringERC20Amount',
      },
      SET_ERC20_AMOUNT: { actions: 'setERC20Amount' },
      SET_FIAT_AMOUNT: { actions: 'setFiatAmount' },
      SET_LOADING: { actions: 'setLoading' },
      GO_BACK: { target: 'step-1-enteringERC20Amount' },
    },
    states: {
      'step-1-enteringERC20Amount': {
        always: [
          {
            target: 'step-4-enteringFIATAmount',
            cond: (ctx) => ctx.hasAllowance && ctx.isProxyAvailable && ctx.erc20Amount.gt(0),
          },
        ],
        entry: [assign({ currentStepNumber: (_) => 1 })],
        on: {
          CLICK_SETUP_PROXY: 'step-2-setupProxy',
          CLICK_ALLOW: 'step-3-approveAllowance',
        },
      },
      'step-2-setupProxy': {
        always: {
          target: 'step-1-enteringERC20Amount',
          cond: (ctx) => ctx.isProxyAvailable,
        },
        entry: [assign({ currentStepNumber: (_) => 2 })],
      },
      'step-3-approveAllowance': {
        entry: [assign({ currentStepNumber: (_) => 3 })],
      },
      'step-4-enteringFIATAmount': {
        entry: [assign({ currentStepNumber: (_) => 4 })],
        always: {
          target: 'step-1-enteringERC20Amount',
          cond: (ctx) => !ctx.erc20Amount.gt(0),
        },
        on: {
          // CLICK_DEPLOY: [{ target: 'step-5-addCollateral' }],
          CONFIRM: 'confirming-position',
        },
      },
      'step-5-addCollateral': {
        entry: [assign({ currentStepNumber: (_) => 5 })],
        on: {
          CONFIRM: 'confirming-position',
        },
      },
      'confirming-position': {
        invoke: {
          src: 'submitForm',
        },
        on: {
          POSITION_CREATED_SUCCESS: {
            target: 'step-final-congrats',
          },
          POSITION_CREATED_ERROR: {
            target: 'step-4-enteringFIATAmount', // @TODO: error page?
          },
          USER_REJECTED: {
            // @ts-ignore TODO types
            actions: assign({ error: (_) => 'User rejected transaction' }),
            target: 'step-4-enteringFIATAmount',
          },
        },
      },
      'step-final-congrats': {
        entry: [assign({ currentStepNumber: (_) => 7 })],
      },
      'step-final-error': {},
    },
  },
  {
    // Global machine actions (using in events)
    actions: {
      setAllowance: assign<Context, any>((ctx, { hasAllowance }) => ({
        hasAllowance,
      })),
      setProxyAvailable: assign<Context, any>((ctx, { isProxyAvailable }) => ({
        isProxyAvailable,
      })),
      setERC20Amount: assign<Context, any>((_ctx, { erc20Amount }) => ({
        erc20Amount,
      })),
      setFiatAmount: assign<Context, any>((_ctx, { fiatAmount }) => ({
        fiatAmount,
      })),
      setLoading: assign<Context, any>((_ctx, { loading, loadingType }) => ({
        loading,
        loadingType,
      })),
    },
    services: {
      submitForm:
        (
          { erc20Amount, fiatAmount },
          // TODO: types
          {
            // @ts-ignore
            createPosition,
          },
        ) =>
        (callback: any) => {
          try {
            createPosition({ erc20Amount, fiatAmount })
              .then(() => {
                callback('POSITION_CREATED_SUCCESS')
              })
              .catch((e: any) => {
                if (e.code === 4001) {
                  callback('USER_REJECTED')
                } else {
                  callback('POSITION_CREATED_ERROR')
                }
              })
          } catch (e) {
            callback('POSITION_CREATED_ERROR')
          }
        },
    },
  },
)

export default stepperMachine
