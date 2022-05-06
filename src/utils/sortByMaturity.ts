interface SortItem {
  protocol?: string
  maturity: Date
}

export default function sortByMaturity(items: SortItem[] | undefined) {
  items?.sort((a, b) => {
    if (a.maturity < b.maturity) return -1

    // Optional tiebreaker
    if (a.maturity.getTime() === b.maturity.getTime() && a.protocol && b.protocol) {
      return a.protocol.toLowerCase() < b.protocol.toLowerCase() ? -1 : 1
    }

    return 1
  })
}
