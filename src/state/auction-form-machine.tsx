import { createMachine } from 'xstate'
// Available variables:
// - Machine
// - interpret
// - assign
// - send
// - sendParent
// - spawn
// - raise
// - actions
// - XState (all XState exports)

const auctionFormMachine = createMachine({
  id: 'auctions',
  initial: 'idle',
  context: {
    retries: 0,
  },
  states: {
    idle: {
      on: {
        FETCH: 'loading',
      },
    },
    loading: {
      on: {
        RESOLVE: 'createProxy',
      },
    },
    createProxy: {
      on: {
        PROXY_CREATED: 'setFiatAllowance',
      },
    },
    setFiatAllowance: {
      on: {
        FIAT_ALLOWANCE_GIVEN: 'setMonetaAllowance',
      },
    },
    setMonetaAllowance: {
      on: {
        MONETA_ALLOWANCE_GIVEN: 'buyCollateral',
      },
    },
    buyCollateral: {
      on: {
        PURCHASE_AMOUNT_SUBMITTED: 'confirmPurchase',
      },
    },
    confirmPurchase: {
      on: {
        PURCHASE_CONFIRMED: 'success',
      },
    },
    success: {
      type: 'final',
    },
  },
})

export default auctionFormMachine
