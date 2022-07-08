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

// Async sequence pattern
// https://xstate.js.org/docs/patterns/sequence.html

// Dispatching updated data to machine with use effect
// https://xstate.js.org/docs/recipes/react.html#syncing-data-with-useeffect

// Transitions for dynamic initial state with actions / guards
// https://xstate.js.org/docs/guides/transitions.html#eventless-always-transitions
const auctionFormMachine = createMachine({
  id: 'auctions',
  initial: 'createProxy',
  context: {
    hasProxy: false,
    hasFiatAllowance: false,
    hasMonetaAllowance: false,
    collateralPurchaseAmount: 0,
    stepNumber: 1,
  },
  states: {
    createProxy: {
      on: {
        PROXY_CREATED: 'setFiatAllowance',
      },
      meta: {
        description: 'Create a Proxy to interact with auctions',
        buttonText: 'Create Proxy',
      },
    },
    setFiatAllowance: {
      on: {
        FIAT_ALLOWANCE_GIVEN: 'success',
        /* FIAT_ALLOWANCE_GIVEN: 'setMonetaAllowance', */
      },
      meta: {
        description: 'MIO bitch',
      },
    },
    /* setMonetaAllowance: { */
    /*   on: { */
    /*     MONETA_ALLOWANCE_GIVEN: 'buyCollateral', */
    /*   }, */
    /* }, */
    /* buyCollateral: { */
    /*   on: { */
    /*     PURCHASE_AMOUNT_SUBMITTED: 'confirmPurchase', */
    /*   }, */
    /* }, */
    /* confirmPurchase: { */
    /*   on: { */
    /*     PURCHASE_CONFIRMED: 'success', */
    /*   }, */
    /* }, */
    success: {
      type: 'final',
    },
  },
})

export default auctionFormMachine
