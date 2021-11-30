import { secondsToDhm } from './date'
import { BLOCKS_PER_MINUTE } from '../constants/misc'
import { Block } from '@ethersproject/abstract-provider'
import add from 'date-fns/add'
import sub from 'date-fns/sub'

export function formatBlocksToTime(blocks: number): string {
  const min = blocks / BLOCKS_PER_MINUTE
  return secondsToDhm(min * 60)
}

export function getBlockDate(currentBlock: Block, block: number): Date {
  const currentBlockDate = new Date(currentBlock.timestamp * 1000)
  const currentBlockNumber = currentBlock.number
  const diff = currentBlockNumber >= block ? currentBlockNumber - block : block - currentBlockNumber
  const diffInMinutes = diff / BLOCKS_PER_MINUTE

  const operation = block > currentBlock.number ? add : sub
  return operation(currentBlockDate, { minutes: diffInMinutes })
}
