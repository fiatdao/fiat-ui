/// A script for trasnferring tokens from whales into your own account
/// when running a local mainnet fork with ganache.
/// Requires a impersonating the whale accounts with `ganache --wallet.unlockedAccounts="<address_to_impersonate>"`
/// See example of unlocking multiple accounts in the `run-testnet.sh` script

/* eslint-disable @typescript-eslint/no-var-requires */
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const ethers = require('ethers')
const curve = require('@curvefi/api').default
const fs = require('fs')

;(async () => {
  /// Steal tokens from a whale
  /// Any address to steal tokens from must be unlocked. See docstring at top of file
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
        .toString()}\n`,
    )
  }

  /// Deposit LUSD for LUSD-3Crv LP token (underlier for the mainnet collateral)
  const depositLusdForLusd3Crv = async (privateKey) => {
    console.log('Depositing LUSD for LUSD3Crv')
    await curve.init(
      'JsonRpc',
      {
        privateKey: privateKey,
      },
      {},
    )
    const pool = curve.getPool('lusd')

    // const coinbals = await pool.wallet.underlyingCoinBalances()
    // console.log('coinbals: ', coinbals)
    // const expectedLP = await pool.depositExpected([10000, 0, 0, 0])
    // console.log('expectedlp: ', expectedLP)

    let isApproved = await pool.depositIsApproved([10000, 0, 0, 0])
    if (!isApproved) {
      console.log('Approving deposit...')
      await pool.depositApprove([100000, 0, 0, 0])
    }
    await pool.deposit(['10000', '0', '0', '0'], 0.1) // slippage = 0.1 %
    const lpTokenBalance = await pool.wallet.lpTokenBalances()
    console.log('Successful deposit!')
    console.log('LUSD3Crv LP token balance', lpTokenBalance)
  }

  // Parse args
  const args = yargs(hideBin(process.argv))
    .option('to', {
      description: 'The address of the account to send tokens to',
      string: true,
    })
    .option('privateKey', {
      description:
        'The 0x-prefixed private key of the account to send tokens to (needed to deposit LUSD for LUSD3Crv)',
      string: true,
    }).argv
  const toAddress = args.to
  const toPrivateKey = args.privateKey

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

    const lusdWhaleSigner = provider.getSigner('0x3ddfa8ec3052539b6c9549f12cea2c295cff5296') // justin sun kek
    const mainnetLusdAddress = '0x5f98805A4E8be255a32880FDeC7F6728C6568bA0'
    const lusdToken = new ethers.Contract(mainnetLusdAddress, erc20Abi, provider)
    await stealWhaleTokens(lusdWhaleSigner, toAddress, lusdToken, 10000)
    await depositLusdForLusd3Crv(toPrivateKey)
  } catch (e) {
    console.error('Error stealing tokens', e)
  }
})()
