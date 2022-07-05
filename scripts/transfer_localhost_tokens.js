/// A script for trasnferring tokens from whales into your own account
/// when running a local mainnet fork with ganache.
/// Requires a impersonating the whale accounts with `ganache --wallet.unlockedAccounts="<address_to_impersonate>"`

/* eslint-disable @typescript-eslint/no-var-requires */
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const ethers = require('ethers')
const fs = require('fs')

;(async () => {
  const stealWhaleTokens = async (whaleSigner, toAddress, tokenContract, amount) => {
    const tokenSymbol = await tokenContract.symbol()
    console.log(`Transferring ${tokenSymbol} tokens to address: `, toAddress)
    const connectedTokContract = await tokenContract.connect(whaleSigner)

    const tokenDecimals = await connectedTokContract.decimals()
    const exp = ethers.BigNumber.from(10).pow(tokenDecimals)
    const bnAmount = ethers.BigNumber.from(amount).mul(exp)
    await connectedTokContract.transfer(toAddress, bnAmount)

    console.log(
      `Success! Your ${tokenSymbol} balance is now: ${(
        await connectedTokContract.balanceOf(toAddress)
      )
        .div(exp)
        .toString()}`,
    )
  }

  const args = yargs(hideBin(process.argv)).option('to', {
    description: 'The address to send tokens to',
    string: true,
  }).argv
  const toAddress = args.to

  const erc20Abi = JSON.parse(fs.readFileSync('./src/abis/ERC20.json'))
  const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545')
  try {
    const usdcWhaleSigner = provider.getSigner('0xCFFAd3200574698b78f32232aa9D63eABD290703')
    const mainnetUSDCAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
    const usdcToken = new ethers.Contract(mainnetUSDCAddress, erc20Abi, provider)
    await stealWhaleTokens(usdcWhaleSigner, toAddress, usdcToken, 10000)

    const daiWhaleSigner = provider.getSigner('0x16b34ce9a6a6f7fc2dd25ba59bf7308e7b38e186')
    const mainnetDaiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
    const daiToken = new ethers.Contract(mainnetDaiAddress, erc20Abi, provider)
    await stealWhaleTokens(daiWhaleSigner, toAddress, daiToken, 10000)
  } catch (e) {
    console.error('Error stealing tokens', e)
  }
})()
