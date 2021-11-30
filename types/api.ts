export type USER = {
  address?: string
  email: string
  discord_handle?: string
  first_name: string
  last_name: string
}
export type USER_ME = {
  email_verified: boolean
  discord_verified: boolean
  can_mint: boolean
  merkle_proof: null | string[]
} & USER

export enum SALE_STATUS {
  REGISTER = 'register',
  RAFFLE = 'raffle',
  PAUSE_FOR_MARKETING = 'pause_for_marketing',
  MINT = 'mint',
  PUBLIC_SALE = 'public_sale',
}

export type SALE = {
  status: SALE_STATUS
  raffle_start_date: string
  mint_end_date: string
  reveal_date: string
}
