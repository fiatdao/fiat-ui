import s from './s.module.scss'
import React from 'react'
import BigNumber from 'bignumber.js'
import { isMobile } from 'react-device-detect'
import cn from 'classnames'
import Slider from '@/src/components/antd/slider'
import { MAX_UINT_256, formatBigValue } from '@/src/web3/utils'

import Grid from '@/src/components/custom/grid'
import Icon, { TokenIconNames } from '@/src/components/custom/icon'
import NumericInput from '@/src/components/custom/numeric-input'
import { Text } from '@/src/components/custom/typography'

export type TokenAmountProps = {
  className?: string
  tokenIcon?: TokenIconNames | React.ReactNode
  max?: number | BigNumber
  maximumFractionDigits?: number
  value?: number | BigNumber
  name?: string
  disabled?: boolean
  slider?: boolean
  displayDecimals?: number
  onChange?: (value?: BigNumber) => void
}

const TokenAmount: React.FC<TokenAmountProps> = (props) => {
  const {
    className,
    disabled = false,
    displayDecimals = 4,
    max,
    maximumFractionDigits = 4,
    name,
    onChange,
    slider = false,
    tokenIcon,
    value,
  } = props

  const step = 1 / 10 ** Math.min(displayDecimals, 6)
  const bnMaxValue = new BigNumber(max ?? MAX_UINT_256)

  const bnValue = value !== undefined ? BigNumber.min(new BigNumber(value), bnMaxValue) : undefined

  function onMaxHandle() {
    onChange?.(bnMaxValue)
  }

  function handleInputChange(inputValue?: BigNumber) {
    onChange?.(inputValue ? BigNumber.min(inputValue, bnMaxValue) : undefined)
  }

  function onSliderChange(sliderValue: number) {
    onChange?.(new BigNumber(sliderValue))
  }

  return (
    <Grid flow="row" gap={32}>
      <NumericInput
        addonAfter={
          max !== undefined ? (
            <button
              className={cn('button-ghost', s.maxBtn)}
              disabled={disabled}
              onClick={onMaxHandle}
              type="button"
            >
              <span>MAX</span>
            </button>
          ) : null
        }
        addonBefore={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {typeof tokenIcon === 'string' && (
              <Icon height={30} name={tokenIcon as TokenIconNames} width={30} />
            )}
            {typeof tokenIcon === 'object' && tokenIcon}
            <div className="mr-8" />
            {!isMobile && (
              <Text color="primary" type="lb1" weight="semibold">
                {name === 'gOHM_FDT_SLP_Amphora' ? 'gOHM_FDT_SLP' : name}
              </Text>
            )}
          </div>
        }
        className={cn(s.component, className)}
        disabled={disabled}
        maximumFractionDigits={maximumFractionDigits}
        onChange={handleInputChange}
        placeholder={
          max !== undefined ? `0 (Max ${formatBigValue(bnMaxValue, displayDecimals)})` : ''
        }
        value={bnValue}
      />
      {slider && (
        <Slider
          disabled={disabled}
          max={bnMaxValue.toNumber()}
          min={0}
          onChange={onSliderChange}
          step={step}
          tipFormatter={(sliderValue) =>
            sliderValue ? formatBigValue(new BigNumber(sliderValue), displayDecimals) : 0
          }
          tooltipPlacement="bottom"
          value={bnValue?.toNumber()}
        />
      )}
    </Grid>
  )
}

export default TokenAmount
