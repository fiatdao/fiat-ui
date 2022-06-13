import BigNumber from 'bignumber.js'
import { assign, createMachine } from 'xstate'

export const TITLES_BY_STEP_UNDERLYING: { [key: number]: { title: string; subtitle: string } } = {
  1: {
    title: 'Configure Your Position',
    subtitle: 'Select underlier amount to deposit and how much FIAT to mint.',
  },
  2: {
    title: 'Create a Proxy Contract',
    subtitle: 'The Proxy Contract will allow you to interact with the FIAT protocol.',
  },
  3: {
    title: 'Set Collateral Allowance',
    subtitle: 'Give permission to the FIAT protocol to manage your underlier.',
  },
  4: {
    title: 'Configure Your Position',
    subtitle: 'Select underlier amount to deposit and how much FIAT to mint.',
  },
  5: {
    title: 'Confirm Your New Position',
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
  totalStepNumber: 4,
  tokenSymbol: '',
  tokenAddress: '',
  hasAllowance: false,
  isProxyAvailable: false,
  loading: false,
  loadingType: '',
}

const STEP_ENTER_AMOUNTS = 'step-1-enterAmounts'
const STEP_SETUP_PROXY = 'step-3-setupProxy'
const STEP_APPROVE_ALLOWANCE = 'step-4-approveAllowance'
const STEP_ADD_COLLATERAL = 'step-5-addCollateral'
const STEP_CONFIRM_POSITION = 'confirming-position'
const STEP_FINAL_CONGRATS = 'step-final-congrats'
const STEP_FINAL_ERROR = 'step-final-error'

const underlyingStepperMachine = createMachine<Context, Events>(
  {
    id: 'stepper',
    initial: STEP_ENTER_AMOUNTS,
    context: initialContext,
    on: {
      SET_HAS_ALLOWANCE: {
        actions: 'setAllowance',
        target: STEP_ENTER_AMOUNTS,
      },
      SET_PROXY_AVAILABLE: {
        actions: 'setProxyAvailable',
        target: STEP_ENTER_AMOUNTS,
      },
      SET_ERC20_AMOUNT: { actions: 'setERC20Amount' },
      SET_UNDERLIER_AMOUNT: { actions: 'setUnderlierAmount' },
      SET_FIAT_AMOUNT: { actions: 'setFiatAmount' },
      SET_LOADING: { actions: 'setLoading' },
      GO_BACK: { target: STEP_ENTER_AMOUNTS },
    },
    states: {
      [STEP_ENTER_AMOUNTS]: {
        always: [
          {
            target: STEP_ADD_COLLATERAL,
            cond: (ctx) => ctx.hasAllowance && ctx.isProxyAvailable,
          },
        ],
        entry: [assign({ currentStepNumber: (_) => 1 })],
        on: {
          CLICK_SETUP_PROXY: STEP_SETUP_PROXY,
          CLICK_ALLOW: STEP_APPROVE_ALLOWANCE,
        },
      },
      [STEP_SETUP_PROXY]: {
        always: {
          target: STEP_ENTER_AMOUNTS,
          cond: (ctx) => ctx.isProxyAvailable,
        },
        entry: [assign({ currentStepNumber: (_) => 2 })],
      },
      [STEP_APPROVE_ALLOWANCE]: {
        entry: [assign({ currentStepNumber: (_) => 3 })],
      },
      [STEP_ADD_COLLATERAL]: {
        entry: [assign({ currentStepNumber: (_) => 4 })],
        on: {
          CONFIRM: STEP_CONFIRM_POSITION,
        },
      },
      [STEP_CONFIRM_POSITION]: {
        invoke: {
          src: 'submitForm',
        },
        on: {
          POSITION_CREATED_SUCCESS: {
            target: STEP_FINAL_CONGRATS,
          },
          POSITION_CREATED_ERROR: {
            target: STEP_ADD_COLLATERAL, // @TODO: error page?
          },
          USER_REJECTED: {
            // @ts-ignore TODO types
            actions: assign({ error: (_) => 'User rejected transaction' }),
            target: STEP_ADD_COLLATERAL,
          },
        },
      },
      [STEP_FINAL_CONGRATS]: {
        entry: [assign({ currentStepNumber: (_) => 7 })],
      },
      [STEP_FINAL_ERROR]: {},
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
      setUnderlierAmount: assign<Context, any>((_ctx, { underlierAmount }) => ({
        underlierAmount,
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
          { fiatAmount, underlierAmount },
          // TODO: types
          {
            // @ts-ignore
            createUnderlyingPosition,
          },
        ) =>
        (callback: any) => {
          try {
            createUnderlyingPosition({ underlierAmount, fiatAmount })
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

export default underlyingStepperMachine
