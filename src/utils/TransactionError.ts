export class TransactionError extends Error {
  code?: number | string
  data?: string
  constructor(message?: string, code?: number, data?: any) {
    super(message)
    if (code != null) {
      this.name = `Transaction Failed ${code.toString()}`
    } else {
      this.name = `Transaction Failed`
    }
    this.code = code
    this.data = JSON.stringify(data)
  }
}
