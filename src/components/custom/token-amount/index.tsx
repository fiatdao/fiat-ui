import s from './s.module.scss'
import React from 'react'
import BigNumber from 'bignumber.js'
import cn from 'classnames'
import classNames from 'classnames'
import { MAX_UINT_256 } from '@/src/constants/misc'
import Slider from '@/src/components/antd/slider'
import { formatBigValue } from '@/src/web3/utils'

import { TokenIconNames } from '@/src/components/custom/icon'
import NumericInput from '@/src/components/custom/numeric-input'
import { AssetIcons } from '@/src/components/custom/asset-icons'
import ButtonOutlineGradient from '@/src/components/antd/button-outline-gradient'
import Tooltip from '@/src/components/antd/tooltip'
import Info from '@/src/resources/svg/info.svg'

export type TokenAmountProps = {
  className?: string
  disabled?: boolean
  displayDecimals?: number
  hidden?: boolean
  max?: number | BigNumber
  maximumFractionDigits?: number
  name?: string
  onChange?: (value?: BigNumber) => void
  slider?: boolean | 'healthFactorVariant' | 'healthFactorVariantReverse'
  tokenIcon?: TokenIconNames | React.ReactNode
  value?: number | BigNumber
  mainAsset?: string
  secondaryAsset?: string
  healthFactorValue?: number | string
}

const TokenAmount: React.FC<TokenAmountProps> = (props) => {
  const {
    className,
    disabled = false,
    displayDecimals = 4,
    healthFactorValue = 0,
    hidden,
    mainAsset,
    max,
    maximumFractionDigits = 4,
    onChange,
    secondaryAsset,
    slider = false,
    tokenIcon,
    value,
  } = props

  const step = 1 / 10 ** Math.min(displayDecimals, 6)
  const bnMaxValue = BigNumber.from(max) ?? MAX_UINT_256

  const bnValue = value !== undefined ? BigNumber.min(value, bnMaxValue) : undefined

  function onMaxHandle() {
    onChange?.(bnMaxValue)
  }

  function handleInputChange(inputValue?: BigNumber) {
    onChange?.(inputValue ? BigNumber.min(inputValue, bnMaxValue) : undefined)
  }

  function onSliderChange(sliderValue: number) {
    onChange?.(BigNumber.from(sliderValue))
  }

  return (
    <>
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
            {tokenIcon ? (
              tokenIcon
            ) : (
              <AssetIcons
                dimensions={'32px'}
                mainAsset={mainAsset}
                secondaryAsset={secondaryAsset}
              />
            )}
          </div>
        }
        className={cn(s.component, className)}
        disabled={disabled}
        hidden={hidden}
        maximumFractionDigits={maximumFractionDigits}
        onChange={handleInputChange}
        placeholder={
          max !== undefined
            ? `0 (Max ${formatBigValue(bnMaxValue.toNumber(), displayDecimals)})`
            : ''
        }
        value={bnValue}
      />
      {slider && !hidden && (
        <>
          {slider === 'healthFactorVariant' && (
            <div className={s.healthFactorWrapper}>
              <div className={s.safer}>Safer</div>
              <div className={s.healthFactor}>
                <span>
                  Health Factor <span className={s.hf}>{healthFactorValue}</span>
                </span>
                <Tooltip
                  title={
                    'A score representing your risk of collateral liquidation, with scores of 1 or below triggering collateral auction.'
                  }
                >
                  <Info />
                </Tooltip>
              </div>
              <div className={s.riskier}>Riskier</div>
            </div>
          )}
          {slider === 'healthFactorVariantReverse' && (
            <div className={classNames(s.healthFactorWrapper, s.reverse)}>
              <div className={s.safer}>Safer</div>
              <div className={s.healthFactor}>
                <span>
                  Health Factor <span className={s.hf}>{healthFactorValue}</span>
                </span>
                <Tooltip
                  title={
                    'A score representing your risk of collateral liquidation, with scores of 1 or below triggering collateral auction.'
                  }
                >
                  <Info />
                </Tooltip>
              </div>
              <div className={s.riskier}>Riskier</div>
            </div>
          )}
          <Slider
            disabled={disabled}
            healthFactorVariant={slider === 'healthFactorVariant'}
            healthFactorVariantReverse={slider === 'healthFactorVariantReverse'}
            // @TODO: we shouldn't use bnMaxValue.toNumber() because it loses precision
            max={Number(bnMaxValue.toFixed(0, 8))}
            min={0}
            onChange={onSliderChange}
            step={step}
            tooltipVisible={false}
            value={Number(bnValue?.toFixed(0, 8))}
          />
        </>
      )}
    </>
  )
}

export default TokenAmount
