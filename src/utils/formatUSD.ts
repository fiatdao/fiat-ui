export default function formatUSD(value: number): string {
  return new Intl.NumberFormat('en').format(value)
}
