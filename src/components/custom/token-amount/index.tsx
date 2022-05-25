import s from './s.module.scss'
import cn from 'classnames'
import BigNumber from 'bignumber.js'
import React from 'react'
import { MAX_UINT_256, MIN_EPSILON_OFFSET } from '@/src/constants/misc'
import Slider from '@/src/components/antd/slider'
import { formatBigValue } from '@/src/web3/utils'

import { TokenIconNames } from '@/src/components/custom/icon'
import NumericInput from '@/src/components/custom/numeric-input'
import { AssetIcons } from '@/src/components/custom/asset-icons'
import ButtonOutlineGradient from '@/src/components/antd/button-outline-gradient'
import Tooltip from '@/src/components/antd/tooltip'
import { getPTokenIconFromMetadata } from '@/src/constants/bondTokens'
import Info from '@/src/resources/svg/info.svg'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'

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

const healthFactorHint =
  'The health factor is a score representing the risk for a given position to be liquidated. ' +
  'A position can be liquidated if the health factor is less than 1.0. ' +
  'The health factor is derived from the positions ratio between the deposited collateral and the outstanding ' +
  'debt denominated in FIAT using the following formula: ' +
  'collateral * collateralValue / debt / collateralizationRatio.'

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
    slider = false,
    tokenIcon,
    value,
  } = props

  const step = 1 / 10 ** Math.min(displayDecimals, 6)
  const bnMaxValue = BigNumber.from(max) ?? MAX_UINT_256
  const bnValue = value !== undefined ? BigNumber.min(value, bnMaxValue) : undefined

  const { appChainId } = useWeb3Connection()

  function onMaxHandle() {
    onChange?.(bnMaxValue)
  }

  function handleInputChange(inputValue?: BigNumber) {
    onChange?.(inputValue ? BigNumber.min(inputValue, bnMaxValue) : undefined)
  }

  function onSliderChange(sliderValue: number) {
    const bigNumberSliderValue = BigNumber.from(sliderValue)
    if (bigNumberSliderValue.plus(MIN_EPSILON_OFFSET).gte(bnMaxValue)) {
      // Dragging slider to max can result in a `sliderValue` slightly lower than max
      // due to precision differences between the `number` and `BigNumber` types
      // So, if `sliderValue` is extremely close to max slider value, just max out the slider
      onChange?.(BigNumber.from(bnMaxValue))
    } else {
      onChange?.(bigNumberSliderValue)
    }
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
                mainAsset={getPTokenIconFromMetadata(appChainId, mainAsset)?.main}
                secondaryAsset={getPTokenIconFromMetadata(appChainId, mainAsset)?.secondary}
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
                <Tooltip title={healthFactorHint}>
                  <Info />
                </Tooltip>
              </div>
              <div className={s.riskier}>Riskier</div>
            </div>
          )}
          {slider === 'healthFactorVariantReverse' && (
            <div className={cn(s.healthFactorWrapper, s.reverse)}>
              <div className={s.safer}>Safer</div>
              <div className={s.healthFactor}>
                <span>
                  Health Factor <span className={s.hf}>{healthFactorValue}</span>
                </span>
                <Tooltip title={healthFactorHint}>
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
            max={bnMaxValue.toNumber()}
            min={0}
            onChange={onSliderChange}
            step={step}
            tooltipVisible={false}
            value={bnValue?.toNumber()}
          />
        </>
      )}
    </>
  )
}

export default TokenAmount
