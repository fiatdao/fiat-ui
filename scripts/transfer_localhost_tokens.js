/// A script for trasnferring tokens from whales into your own account
/// when running local mainnet fork with ganache.
/// Requires a impersonating the whale accounts with `ganache --wallet.unlockedAccounts="<address_to_impersonate>"`

/* eslint-disable @typescript-eslint/no-var-requires */
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const ethers = require('ethers')
const fs = require('fs')

;(async () => {
  const args = yargs(hideBin(process.argv)).option('to', {
    description: 'The address to send tokens to',
    string: true,
  }).argv

  const toAddress = args.to
  console.log('Transferring USDC tokens to address: ', toAddress)

  const erc20Abi = JSON.parse(fs.readFileSync('./src/abis/ERC20.json'))

  const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545')
  const usdcWhaleSigner = provider.getSigner('0xCFFAd3200574698b78f32232aa9D63eABD290703')
  const mainnetUSDCAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
  const usdcToken = new ethers.Contract(mainnetUSDCAddress, erc20Abi, usdcWhaleSigner)

  try {
    const tokenDecimals = await usdcToken.decimals()
    const exp = ethers.BigNumber.from(10).pow(tokenDecimals)
    const amount = ethers.BigNumber.from(10000).mul(exp)
    await usdcToken.transfer(toAddress, amount)
  } catch (e) {
    console.error('Error: ', e)
  }
})()
