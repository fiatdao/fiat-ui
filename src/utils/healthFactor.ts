const healthFactor = (hf: number) => {
  if (hf > 4.0) {
    return 'green'
  }
  if (hf > 1.0) {
    return 'orange'
  }
  return 'red'
}

export { healthFactor }
