import { assign, createMachine } from 'xstate'

export interface Context {
  skipped: boolean
  totalSteps: number
  fiatTokenIsAdded: boolean
  fdtTokenIsAdded: boolean
  discountRateVideoComplete: boolean
  healthScoreVideoComplete: boolean
  assetMaturityVideoComplete: boolean
}

type Events =
  | { type: 'NEXT' }
  | { type: 'SKIP' }
  | { type: 'ADD_FDT' }
  | { type: 'ADD_FIAT' }
  | { type: 'COMPLETE_DISCOUNT_RATE_VIDEO' }
  | { type: 'COMPLETE_HEALTH_SCORE_VIDEO' }
  | { type: 'COMPLETE_ASSET_MATURITY_VIDEO' }

// visualize this state: https://stately.ai/viz/fdad938e-1eb3-4de6-8b77-f7240f790784

const gettingStartedMachine = createMachine<Context, Events>({
  id: 'GettingStarted',
  initial: '1',
  context: {
    skipped: false,
    totalSteps: 4,
    fiatTokenIsAdded: false,
    fdtTokenIsAdded: false,
    discountRateVideoComplete: false,
    healthScoreVideoComplete: false,
    assetMaturityVideoComplete: false,
  },
  on: {
    SKIP: {
      target: '5',
      actions: assign<Context, any>(() => ({
        skipped: true,
      })),
    },
  },
  states: {
    '1': {
      id: 'go-to-dashboard',
      on: {
        NEXT: '2',
      },
    },
    '2': {
      id: 'add-tokens',
      on: {
        NEXT: '3',
        ADD_FIAT: {
          actions: assign<Context, any>(() => ({
            fiatTokenIsAdded: true,
          })),
        },
        ADD_FDT: {
          actions: assign<Context, any>(() => ({
            fdtTokenIsAdded: true,
          })),
        },
      },
    },
    '3': {
      id: 'key-concepts',
      always: {
        target: '4',
        cond: (ctx) =>
          ctx.discountRateVideoComplete &&
          ctx.healthScoreVideoComplete &&
          ctx.assetMaturityVideoComplete,
      },
      on: {
        COMPLETE_DISCOUNT_RATE_VIDEO: {
          actions: assign<Context, any>(() => ({
            discountRateVideoComplete: true,
          })),
        },
        COMPLETE_HEALTH_SCORE_VIDEO: {
          actions: assign<Context, any>(() => ({
            healthScoreVideoComplete: true,
          })),
        },
        COMPLETE_ASSET_MATURITY_VIDEO: {
          actions: assign<Context, any>(() => ({
            assetMaturityVideoComplete: true,
          })),
        },
      },
    },
    '4': {
      id: 'mint-fiat',
      on: {
        NEXT: '5',
      },
    },
    '5': {
      type: 'final',
    },
  },
})

export default gettingStartedMachine
