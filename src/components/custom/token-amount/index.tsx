import s from './s.module.scss'
import React from 'react'
import BigNumber from 'bignumber.js'
import cn from 'classnames'
import Slider from '@/src/components/antd/slider'
import { MAX_UINT_256, formatBigValue } from '@/src/web3/utils'

import Grid from '@/src/components/custom/grid'
import { TokenIconNames } from '@/src/components/custom/icon'
import NumericInput from '@/src/components/custom/numeric-input'
import { AssetIcons } from '@/src/components/custom/asset-icons'
import ButtonOutlineGradient from '@/src/components/antd/button-outline-gradient'

export type TokenAmountProps = {
  className?: string
  disabled?: boolean
  displayDecimals?: number
  hidden?: boolean
  max?: number | BigNumber
  maximumFractionDigits?: number
  name?: string
  onChange?: (value?: BigNumber) => void
  slider?: boolean | 'healthFactorVariant'
  tokenIcon?: TokenIconNames | React.ReactNode
  value?: number | BigNumber
}

const TokenAmount: React.FC<TokenAmountProps> = (props) => {
  const {
    className,
    disabled = false,
    displayDecimals = 4,
    hidden,
    max,
    maximumFractionDigits = 4,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    name,
    onChange,
    slider = false,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    <Grid flow="row" gap={12}>
      <NumericInput
        addonAfter={
          max !== undefined ? (
            <ButtonOutlineGradient disabled={disabled} onClick={onMaxHandle} textGradient>
              Max
            </ButtonOutlineGradient>
          ) : null
        }
        addonBefore={
          <div className={cn(s.iconsWrapper)}>
            <AssetIcons dimensions={'32px'} mainAsset={'SBOND'} secondaryAsset={'DAI'} />
          </div>
        }
        className={cn(s.component, className)}
        disabled={disabled}
        hidden={hidden}
        maximumFractionDigits={maximumFractionDigits}
        onChange={handleInputChange}
        placeholder={
          max !== undefined ? `0 (Max ${formatBigValue(bnMaxValue, displayDecimals)})` : ''
        }
        value={bnValue}
      />
      {slider && !hidden && (
        <Slider
          disabled={disabled}
          healthFactorVariant={slider === 'healthFactorVariant'}
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
