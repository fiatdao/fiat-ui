// eslint-disable-next-line
const ethers = require('ethers')
// eslint-disable-next-line
// eslint-disable-next-line
const fs = require('fs')

;(async () => {
  const erc20Abi = JSON.parse(fs.readFileSync('../src/abis/ERC20.json'))
  const mainnetUSDCAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'

  const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545')
  const usdcWhaleSigner = provider.getSigner('0xCFFAd3200574698b78f32232aa9D63eABD290703')
  const usdcToken = new ethers.Contract(mainnetUSDCAddress, erc20Abi, usdcWhaleSigner)

  console.log((await usdcToken.balanceOf('0xCFFAd3200574698b78f32232aa9D63eABD290703')).toString())
  const exp = ethers.BigNumber.from(10).pow(await usdcToken.decimals())
  const amount = ethers.BigNumber.from(10000).mul(exp)
  console.log('amt: ', amount.toString())
  await usdcToken.transfer('0xbC518343152587708732083E8fFFdC305885Ae37', amount)
})()
