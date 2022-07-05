# FIAT UI
Get leverage and access secondary liquidity for your favorite DeFi fixed income assets.

## Getting Started Instructions
1. Clone the project:
    ```sh
    git clone git@github.com:fiatdao/fiat-ui.git
    ```

1. Create a `.env.local` file:
    ```sh
    cp .env.example .env.local
    ```
    Make sure to populate it with your own api keys

1. Install Node dependencies:
    ```sh
    yarn
    ```

1. Run `yarn dev` and connect to the Goerli Network to test the app!

#### Running with Localhost Network backend
1. After setting up your `.env.local` file & installing deps, run a local testnet with
    ```sh 
    yarn testnet
    ```

1. Import the first ganache account into your wallet via private key. See here for metamask [instructions](https://metamask.zendesk.com/hc/en-us/articles/360015489331-How-to-import-an-account#h_01G01W07NV7Q94M7P1EBD5BYM4).

1. Ensure you have the Localhost Network in your wallet.

1. Copy the address of the first ganache account and run
    ```sh
    yarn transferLocalhostTokens --to=<first_account_address>
    ```
    to transfer stablecoins into your imported account. After running, you should have thousands of stablecoins to test with!

1. In another terminal, run the frontend with
    ```sh
    yarn dev
    ```

1. You're done! You can now open positions via underlier and buidl!

## How to Contribute
To contribute, start by grabbing one of the open issues on the repo, and assigning it to yourself. Once the task has been completed, open a PR against the `main` branch.

## Helpful Testnet Links
- Goerli USDC Faucet: https://goerli.etherscan.io/address/0x08034634bbd210485c9c8f798afdc5432782fd18#writeContract
- Element.fi: https://testnet.element.fi/mint
- Notional.finance: https://goerli.notional.finance/lend/DAI

