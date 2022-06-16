export interface Step {
  title: string
  description: string | null
}

export type Steps = Step[] | any

export const stepsData: Steps = {
  1: {
    title: 'Look around (Dashboard)',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In volutpat dis volutpat sollicitudin dui. Mauris consectetur sed est nibh tincidunt neque. Tempus eu diam ultrices consequat.',
  },
  2: {
    title: 'Add FDT & FIAT to MetaMask',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In volutpat dis volutpat sollicitudin dui. Mauris consectetur sed est nibh tincidunt neque. Tempus eu diam ultrices consequat.',
  },
  3: {
    title: 'Understand key concepts',
    description: null,
  },
  4: {
    title: 'Borrow FIAT',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In volutpat dis volutpat sollicitudin dui. Mauris consectetur sed est nibh tincidunt neque. Tempus eu diam ultrices consequat.',
  },
}
