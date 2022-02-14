export type ObjectValues<T> = T[keyof T]

export type Await<T> = T extends PromiseLike<infer U> ? U : T

export type Extends<T, U extends T> = U
export type Maybe<T> = T | null

export type TokenData = {
  symbol: string
  address: string
  decimals: number
}
