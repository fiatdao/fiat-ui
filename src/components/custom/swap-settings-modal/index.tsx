import s from './s.module.scss'
import Grid from '@/src/components/custom/grid'
import Modal from '@/src/components/antd/modal'
import { Text } from '@/src/components/custom/typography'
import ButtonGradient from '@/src/components/antd/button-gradient'
import ButtonOutlineGradient from '@/src/components/antd/button-outline-gradient'
import cn from 'classnames'
import React from 'react'
import { InputNumber } from 'antd'

interface Props {
  isOpen: boolean
  toggleOpen: () => void
  slippageTolerance: any
  maxTransactionTime: any
  updateSwapSettings: (slippageTolerance: number, maxTransactionTime: number) => void
}

const SwapSettingsModal: React.FC<Props> = ({
  isOpen,
  maxTransactionTime,
  slippageTolerance,
  toggleOpen,
  updateSwapSettings,
}: Props) => {
  const submitAndClose = () => {
    updateSwapSettings(slippageTolerance, maxTransactionTime)
    toggleOpen()
  }

  return (
    <Modal
      footer={
        <div className={cn(s.footerFlexContainer)}>
          <div className={cn(s.buttons)}>
            <ButtonOutlineGradient onClick={toggleOpen} textGradient>
              Close
            </ButtonOutlineGradient>
          </div>
          <div className={cn(s.buttons)}>
            <ButtonGradient onClick={submitAndClose} type="primary">
              Submit
            </ButtonGradient>
          </div>
        </div>
      }
      maskStyle={{ backdropFilter: 'blur(5px)' }}
      onCancel={toggleOpen}
      visible={isOpen}
      width={400}
    >
      <Grid align="start" flow="row" gap={24}>
        <Grid flow="row" gap={16} width="100%">
          <Text className={cn(s.title)} color="primary" type="h2" weight="bold">
            Swap Settings
          </Text>
          <div className={cn(s.bodyFlexContainer)}>
            <Text color="secondary" type="p1">
              Slippage tolerance
            </Text>
            <InputNumber
              addonAfter={'%'}
              defaultValue={slippageTolerance}
              max={100}
              min={0}
              onChange={(e) => updateSwapSettings(e, maxTransactionTime)}
              step={0.1}
              style={{ width: '100px' }}
            />
          </div>
          <div className={cn(s.bodyFlexContainer)}>
            <Text color="secondary" type="p1">
              Max transaction time
            </Text>
            <InputNumber
              addonAfter={'min'}
              defaultValue={maxTransactionTime}
              max={120}
              min={0}
              onChange={(e) => updateSwapSettings(slippageTolerance, e)}
              style={{ width: '100px' }}
            />
          </div>
        </Grid>
      </Grid>
    </Modal>
  )
}

export default SwapSettingsModal
