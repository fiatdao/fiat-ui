import React                           from 'react'
import s                               from './s.module.scss'
import cn                              from 'classnames'
import Grid                            from '@/src/components/custom/grid'
import Modal                           from '@/src/components/antd/modal'
import { Text }                        from '@/src/components/custom/typography'
import ButtonGradient                  from '@/src/components/antd/button-gradient'
import ButtonOutlineGradient           from '@/src/components/antd/button-outline-gradient'
import { InputNumber }                 from 'antd';

interface Props {
  isOpen: boolean
  toggleOpen: () => void;
  slippageTolerance: any
  maxTransactionTime: any
  updateSwapSettings: (slippageTolerance: number, maxTransactionTime: number) => void
}

const SwapSettingsModal: React.FC<Props> = ({isOpen, toggleOpen, updateSwapSettings, slippageTolerance, maxTransactionTime}: Props) => {

  const submitAndClose = () => {
    updateSwapSettings(slippageTolerance, maxTransactionTime)
    toggleOpen()
  }

  return (
    <Modal
      maskStyle={{ backdropFilter: 'blur(5px)' }}
      onCancel={toggleOpen}
      visible={isOpen}
      width={400}
      footer={
        <div className={cn(s.footerFlexContainer)}>
          <div className={cn(s.buttons)}>
            <ButtonOutlineGradient 
              onClick={toggleOpen} 
              textGradient
            >Close</ButtonOutlineGradient>
          </div>
          <div className={cn(s.buttons)} >
            <ButtonGradient
              type="primary" 
              onClick={submitAndClose}
            >Submit</ButtonGradient>
          </div>
        </div>
      }
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
              style={{width: '100px'}}
                min={0} 
                max={100} 
                defaultValue={slippageTolerance} 
                step={0.1} 
                addonAfter={'%'}
                onChange={(e) => updateSwapSettings(e, maxTransactionTime)}
              />
          </div>
          <div className={cn(s.bodyFlexContainer)}>
            <Text color="secondary" type="p1">
              Max transaction time
            </Text>
            <InputNumber 
                style={{width: '100px'}}
                min={0}
                max={120} 
                defaultValue={maxTransactionTime} 
                addonAfter={'min'}
                onChange={(e) => updateSwapSettings(slippageTolerance, e)}
              />
          </div>
        </Grid>
      </Grid>
    </Modal>
  )
}

export default SwapSettingsModal
