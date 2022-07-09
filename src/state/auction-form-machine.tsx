import { createMachine, assign } from 'xstate'
import { SET_FIAT_ALLOWANCE_PROXY_TEXT } from '../constants/misc'
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

// States to model detailed here in the figma
// https://www.figma.com/file/cFuPSsfFZYhz4hzO0NrytG/FIAT-DAO---Protocol-v1?node-id=1071%3A18962

// To whoever sees this, dart is a superior language to typescript
// Obscure reason #1: [naming conventions for enums](https://groups.google.com/a/dartlang.org/g/misc/c/MQzUXwY2rbI?pli=1)
export enum AuctionStates {
  createProxy = 'CREATE_PROXY',
  setFiatAllowance = 'SET_FIAT_ALLOWANCE',
  success = 'SUCCESS',
}

const auctionFormMachine = createMachine({
  id: 'auctions',
  initial: AuctionStates.createProxy,
  context: {
    hasProxy: false,
    proxyHasFiatAllowance: false,
    hasMonetaAllowance: false,
    collateralPurchaseAmount: 0,
    stepNumber: 1,
  },
  on: {
    SET_HAS_PROXY: {
      actions: [
        (context) => console.log('has proxy b4: ', context.hasProxy),
        assign<any, any>((ctx, e) => (ctx.hasProxy = e.hasProxy)),
        (context) => console.log('has proxy after: ', context.hasProxy),
      ],
    },
    SET_PROXY_HAS_FIAT_ALLOWANCE: {
      actions: [
        assign<any, any>((ctx, e) => (ctx.proxyHasFiatAllowance = e.proxyHasFiatAllowance)),
      ],
    },
  },
  states: {
    [AuctionStates.createProxy]: {
      always: [{ target: AuctionStates.setFiatAllowance, cond: (context) => context.hasProxy }],
      /* on: { */
      /*   PROXY_CREATED: AuctionStates.createProxy, */
      /*   // TODO: transition to next state by using setupProxy hook & dispatching PROXY_CREATED event on success */
      /* }, */
      meta: {
        description: 'Create a Proxy to interact with auctions',
        buttonText: 'Create Proxy',
      },
    },
    [AuctionStates.setFiatAllowance]: {
      /* on: { */
      /* }, */
      always: [{ target: AuctionStates.success, cond: (context) => context.proxyHasFiatAllowance }],
      /* on: { */
      /* FIAT_ALLOWANCE_GIVEN: AuctionStates.success, */
      /* FIAT_ALLOWANCE_GIVEN: 'setMonetaAllowance', */
      /* }, */
      meta: {
        description: 'Set Allowance for FIAT',
        buttonText: SET_FIAT_ALLOWANCE_PROXY_TEXT,
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
    [AuctionStates.success]: {
      type: 'final',
      meta: {
        description: '',
      },
    },
  },
})

export default auctionFormMachine
