import s from './s.module.scss'

import accountImgWithout from '@/src/resources/png/account_img_without.png'
import accountImg from '@/src/resources/png/account_img.png'
import addEnterSrc from '@/src/resources/png/add-enter.png'
import axsSrc from '@/src/resources/png/axie.png'
import circlePlusOutlinedImg from '@/src/resources/png/circle-plus-outlined.png'
import emptyTable from '@/src/resources/png/empty-table.png'
import enterStarSrc from '@/src/resources/png/enter-star.png'
import ETH_FDT_SLPImg from '@/src/resources/png/ETH_FDT_SLP.png'
import fdIconDImg from '@/src/resources/png/fd_icon.png'
import fdtAddImg from '@/src/resources/png/fdt_add.png'
import logoTextDImg from '@/src/resources/png/logo_dark_text.png'
import logoDarkSrc from '@/src/resources/png/logo_dark.png'
import logoTextLImg from '@/src/resources/png/logo_light_text.png'
import logoLightSrc from '@/src/resources/png/logo_light.png'
import manaSrc from '@/src/resources/png/mana.png'
import MKRSrc from '@/src/resources/png/MKR.png'
import plugBgMobileImg from '@/src/resources/png/plug-bg-mobile.png'
import plugBgTabletImg from '@/src/resources/png/plug-bg-tablet.png'
import plugBgImg from '@/src/resources/png/plug-bg.png'
import RGTSrc from '@/src/resources/png/RGT.png'
import romanAmphora from '@/src/resources/png/roman_amphora.png'

// Leaderboard
import romanCorona from '@/src/resources/png/roman_corona.png'
import romanGalea from '@/src/resources/png/roman_galea.png'
import romanGladius from '@/src/resources/png/roman_gladius.png'
import romanKithara from '@/src/resources/png/roman_kithara.png'
import sandSrc from '@/src/resources/png/sandbox.png'
import telegramSrc from '@/src/resources/png/telegram.png'
import aaveSrc from '@/src/resources/png/token-aave.png'
import eslpSrc from '@/src/resources/png/token-eslp.png'
import ilvSrc from '@/src/resources/png/token-ilv.png'
import linkSrc from '@/src/resources/png/token-link.png'
import sushiSrc from '@/src/resources/png/token-sushi.png'
import uslpSrc from '@/src/resources/png/token-uslp.png'
import txFailureImg from '@/src/resources/png/tx-failure.png'
import txProgressImg from '@/src/resources/png/tx-progress.png'
import txSuccessImg from '@/src/resources/png/tx-success.png'
import UMASrc from '@/src/resources/png/UMA.png'
import universeSrc from '@/src/resources/png/universe.png'
import wsOHM_FDT_SUSHI_LPImg from '@/src/resources/png/wsOHM_FDT_SUSHI_LP.png'
import gohm_fdt_slp_amphoraImg from '@/src/resources/png/gohm_fdt_slp_amphora.png'
import gohm_fdt_slp_kitharaImg from '@/src/resources/png/gohm_fdt_slp_kithara.png'
import gohm_fdt_slp_galeaImg from '@/src/resources/png/gohm_fdt_slp_galea.png'
import gohm_fdt_slp_gladiusImg from '@/src/resources/png/gohm_fdt_slp_gladius.png'
import gohm_fdt_slp_coronaImg from '@/src/resources/png/gohm_fdt_slp_corona.png'
import wsOHMSrc from '@/src/resources/png/wsOHM.png'
import YFISrc from '@/src/resources/png/YFI.png'
import notConnected from '@/src/resources/svg/not-connected.svg'
import Sprite from '@/src/resources/svg/icons-sprite.svg'
import cn from 'classnames'
import React, { CSSProperties } from 'react'

export type LogoIconNames = 'png/fiat-dao'

export type RomanIconNames =
  | 'png/roman-corona'
  | 'png/roman-gladius'
  | 'png/roman-galea'
  | 'png/roman-kithara'
  | 'png/roman-amphora'

export type TokenIconNames =
  | 'bond-circle-token'
  | 'bond-square-token'
  | 'token-unknown'
  | 'static/token-bond'
  | 'static/token-uniswap'
  | 'static/tx-progress'
  | 'token-eth'
  | 'token-btc'
  | 'token-weth'
  | 'token-wbtc'
  | 'token-renbtc'
  | 'token-bond'
  | 'token-usdc'
  | 'token-dai'
  | 'token-susd'
  | 'token-uniswap'
  | 'token-usdt'
  | 'token-sushi'
  | 'compound'
  | 'png/enter-star'
  | 'png/universe'
  | 'png/mana'
  | 'png/sandbox'
  | 'png/axie'
  | 'png/aave'
  | 'png/sushi'
  | 'png/link'
  | 'png/ilv'
  | 'png/uslp'
  | 'png/eslp'
  | 'cream_finance'
  | 'png/mkr'
  | 'png/rgt'
  | 'png/uma'
  | 'png/wsOHM'
  | 'png/YFI'
  | 'png/ETH_FDT_SLP'
  | 'png/wsOHM_FDT_SUSHI_LP'
  | 'png/gohm_fdt_slp_amphora'
  | 'png/gohm_fdt_slp_kithara'
  | 'png/gohm_fdt_slp_galea'
  | 'png/gohm_fdt_slp_gladius'
  | 'png/gohm_fdt_slp_corona'
  | 'yearn_finance'

export type NavIconNames =
  | 'paper-bill-outlined'
  | 'paper-alpha-outlined'
  | 'chats-outlined'
  | 'forum-outlined'
  | 'bar-charts-outlined'
  | 'savings-outlined'
  | 'proposal-outlined'
  | 'treasury-outlined'
  | 'bank-outlined'
  | 'tractor-outlined'
  | 'wallet-outlined'
  | 'docs-outlined'

export type ThemeIconNames = 'moon' | 'sun'

export type IconNames =
  | LogoIconNames
  | TokenIconNames
  | NavIconNames
  | ThemeIconNames
  | RomanIconNames
  | 'static/uStar'
  | 'right-arrow-circle-outlined'
  | 'arrow-back'
  | 'down-arrow-circle'
  | 'refresh'
  | 'notification'
  | 'chevron-right'
  | 'close-circle-outlined'
  | 'check-circle-outlined'
  | 'history-circle-outlined'
  | 'close'
  | 'close-tiny'
  | 'dropdown-arrow'
  | 'warning-outlined'
  | 'warning-circle-outlined'
  | 'gear'
  | 'node-status'
  | 'info-outlined'
  | 'network'
  | 'pencil-outlined'
  | 'rate-outlined'
  | 'plus-circle-outlined'
  | 'plus-square-outlined'
  | 'ribbon-outlined'
  | 'bin-outlined'
  | 'add-user'
  | 'search-outlined'
  | 'link-outlined'
  | 'arrow-top-right'
  | 'handshake-outlined'
  | 'stamp-outlined'
  | 'circle-plus-outlined'
  | 'png/circle-plus-outlined'
  | 'circle-minus-outlined'
  | 'senior_tranche'
  | 'junior_tranche'
  | 'senior_tranche_simplified'
  | 'junior_tranche_simplified'
  | 'withdrawal_regular'
  | 'withdrawal_instant'
  | 'statistics'
  | 'filter'
  | 'tx-progress'
  | 'tx-success'
  | 'tx-failure'
  | 'burger'
  | 'burger-close'
  | 'hourglass'
  | 'history'
  | 'piggybank'
  | 'file'
  | 'add-file'
  | 'file-added'
  | 'file-deleted'
  | 'file-clock'
  | 'file-times'
  | 'wallet'
  | 'handshake'
  | 'padlock-unlock'
  | 'stopwatch'
  | 'judge'
  | 'certificate'
  | 'chart-up'
  | 'apy-up'
  | 'chart'
  | 'queue'
  | 'stake'
  | 'auction'
  | 'marketplace'
  | 'social-media'
  | 'about'
  | 'whitepaper'
  | 'team'
  | 'governance'
  | 'yield-farming'
  | 'docs'
  | 'twitter'
  | 'discord'
  | 'dropdown'
  | 'theme-switcher-sun'
  | 'theme-switcher-moon'
  | 'coingecko'
  | 'youtube'
  | 'git'
  | 'medium'
  | 'polymorphs'
  | 'core-drops'
  | 'png/add-enter'
  | 'png/logo-dark'
  | 'png/logo-light'
  | 'png/logo-light-text'
  | 'png/logo-dark-text'
  | 'png/telegram'
  | 'png/empty-table'
  | 'png/account'
  | 'png/account_without'
  | 'png/tx-progress'
  | 'png/tx-success'
  | 'png/tx-failure'
  | 'png/plug-bg-mobile'
  | 'png/plug-bg-tablet'
  | 'png/plug-bg'
  | 'png/fdt_add'
  | 'svg/not-connected'
  | 'static/add-token'

export type IconProps = {
  name: IconNames
  width?: number | string
  height?: number | string
  color?: 'primary' | 'secondary' | 'red' | 'green' | 'blue' | 'inherit'
  rotate?: 0 | 90 | 180 | 270
  className?: string
  style?: CSSProperties
  src?: string
}

const Icon: React.FC<IconProps> = (props) => {
  const { className, color, height = 24, name, rotate, src, style, width = 24, ...rest } = props

  const isStatic = (name ?? '').indexOf('static/') === 0
  const isPng = (name ?? '').indexOf('png/') === 0

  if (isPng) {
    const getSrc = () => {
      switch (name) {
        case 'png/plug-bg-mobile':
          return plugBgMobileImg
        case 'png/fdt_add':
          return fdtAddImg
        case 'png/circle-plus-outlined':
          return circlePlusOutlinedImg
        case 'png/plug-bg-tablet':
          return plugBgTabletImg
        case 'png/plug-bg':
          return plugBgImg
        case 'png/tx-progress':
          return txProgressImg
        case 'png/tx-success':
          return txSuccessImg
        case 'png/tx-failure':
          return txFailureImg
        case 'png/fiat-dao':
          return fdIconDImg
        case 'png/ETH_FDT_SLP':
          return ETH_FDT_SLPImg
        case 'png/wsOHM_FDT_SUSHI_LP':
          return wsOHM_FDT_SUSHI_LPImg
        case 'png/gohm_fdt_slp_amphora':
          return gohm_fdt_slp_amphoraImg
        case 'png/gohm_fdt_slp_kithara':
          return gohm_fdt_slp_kitharaImg
        case 'png/gohm_fdt_slp_galea':
          return gohm_fdt_slp_galeaImg
        case 'png/gohm_fdt_slp_gladius':
          return gohm_fdt_slp_gladiusImg
        case 'png/gohm_fdt_slp_corona':
          return gohm_fdt_slp_coronaImg
        case 'png/mkr':
          return MKRSrc
        case 'png/rgt':
          return RGTSrc
        case 'png/uma':
          return UMASrc
        case 'png/wsOHM':
          return wsOHMSrc
        case 'png/YFI':
          return YFISrc
        case 'png/empty-table':
          return emptyTable
        case 'png/universe':
          return universeSrc
        case 'png/mana':
          return manaSrc
        case 'png/sandbox':
          return sandSrc
        case 'png/axie':
          return axsSrc
        case 'png/aave':
          return aaveSrc
        case 'png/ilv':
          return ilvSrc
        case 'png/link':
          return linkSrc
        case 'png/sushi':
          return sushiSrc
        case 'png/uslp':
          return uslpSrc
        case 'png/eslp':
          return eslpSrc
        case 'png/add-enter':
          return addEnterSrc
        case 'png/enter-star':
          return enterStarSrc
        case 'png/logo-dark':
          return logoDarkSrc
        case 'png/logo-light-text':
          return logoTextLImg
        case 'png/logo-dark-text':
          return logoTextDImg
        case 'png/logo-light':
          return logoLightSrc
        case 'png/telegram':
          return telegramSrc
        case 'png/account':
          return accountImg
        case 'png/account_without':
          return accountImgWithout
        case 'png/roman-corona':
          return romanCorona
        case 'png/roman-gladius':
          return romanGladius
        case 'png/roman-galea':
          return romanGalea
        case 'png/roman-kithara':
          return romanKithara
        case 'png/roman-amphora':
          return romanAmphora
        case 'svg/not-connected':
          return notConnected
        default:
          return ''
      }
    }
    return (
      <img
        alt=""
        className={cn(
          s.component,
          className,
          rotate && `rotate-${rotate}`,
          color && s[`${color}-color`],
        )}
        height={height ?? width}
        src={src || getSrc()}
        style={style}
        width={width}
        {...rest}
      />
    )
  }

  return (
    <svg
      className={cn(
        s.component,
        className,
        rotate && `rotate-${rotate}`,
        color && s[`${color}-color`],
      )}
      height={height ?? width}
      style={style}
      width={width}
      {...rest}
    >
      {!isStatic ? (
        <use xlinkHref={`${Sprite}#icon__${name}`} />
      ) : (
        <use xlinkHref={`#icon__${name}`} />
      )}
    </svg>
  )
}

export default Icon
