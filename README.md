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

#### Running with Forked Mainnet Chain & Forked Subgraph

This is the recommended flow for local testing. It allows you to create positions, manage them (thanks to the local subgraph indexing your created positions), and test with expired collaterals by fast forwarding through blocks on your local chain.

1. In this repo, disable Sentry by replacing the last line of `next.config.js` with
    ```js
    module.exports = moduleExports
    ```
    (if you don't do this you'll get CORS errors when querying your local subgraph)

1. In constants/misc.ts, change the `SUBGRAPH_LOCALHOST` to point to `'http://localhost:8000/subgraphs/name/fiatdao/fiat-subgraph'` by uncommenting line 27

1. Next, clone the `fiat-subgraph` repository
    ```sh
    git clone git@github.com/fiatdao/fiat-subgraph.git
    ```

1. Set up your `.env` for the subgraph repository.
    ```sh
    cp .env.example .env
    ```
    Don't forget to set the `ALCHEMY_API_KEY` variable in your `.env`!

1. Stand up ipfs and postgres containers with `docker-compose -f docker-compose-forking.yml up -d postgres ipfs`

1. Run local ganache chain with
    ```
    ALCHEMY_API_KEY=<your_alchemy_key> && ganache \
    -h="0.0.0.0" \
    --fork.url="https://eth-mainnet.alchemyapi.io/v2/$ALCHEMY_API_KEY" \
    --miner.defaultGasPrice 50000000000
    ```
1. Follow instructions to run a graph node locally: https://github.com/graphprotocol/graph-node#quick-start

1. Run the graph node with `cargo run -p graph-node --release -- --postgres-url postgresql://graph-node:let-me-in@localhost:5432/graph-node --ethereum-rpc mainnet:http://localhost:8545 --ipfs 127.0.0.1:5001 --fork-base https://api.thegraph.com/subgraphs/id/`.

1. Change the deploy script before running to deploy a fork. Comment out L46, uncomment L52 to run the subgraph fork.

1. Deploy the FIAT subgraph to your local graph node. First we give the `deploy.sh` script permissions to execute, then run it by doing
    ```sh
    sudo chmod +x deploy.sh
    CONFIG=mainnet.json NETWORK=mainnet TARGET=local IPFS_NODE=ipfs:5001 GRAPH_NODE=http://localhost:8030 yarn build
    CONFIG=mainnet.json NETWORK=mainnet TARGET=local IPFS_NODE=ipfs:5001 GRAPH_NODE=http://localhost:8030 yarn deploy
    ```
    When prompted with an input like:

    `? Version Label (e.g. v0.0.1) ‣  _ `

    hit enter to deploy the subgraph.

1. Now open the dapp on [localhost:3000](localhost:3000) and connect to the Localhost Mainnet network. You should be able to create and manage positions. You may have to wait a while for the graph to sync with the local chain.

1. When you're done, run `docker-compose -f docker-compose-forking.yml down -v` to tear the ipfs and postgres containers down. To run again, just run `docker-compose -f docker-compose-forking.yml up -d ipfs postgres` again. Your chain should pick up where you left off.

1. If you run into errors, you might have done something out of order. To try again, go into the subgraph repo and tear the containers down, delete the data directory, and bring the containers back up with
    ```sh
    sudo rm -rf ./data
    docker-compose -f docker-compose-forking.yml down -v
    docker-compose -f docker-compose-forking.yml up -d postgres ipfs
    ``` 

#### Running with Forked Mainnet Chain & Subgraph

> NOTE: i haven't gotten this working, got out of memory error with ganache. try the above first

1. After setting up your `.env.local` file & installing dependencies, run the frontend with `yarn dev`

1. Disable Sentry by replacing the last line of `next.config.js` with
    ```js
    module.exports = moduleExports
    ```
    (if you don't do this you'll get CORS errors when querying your local subgraph)

1. Next, clone the `fiat-subgraph` repository
    ```sh
    git clone git@github.com/fiatdao/fiat-subgraph.git
    ```

1. Set up your `.env` for the subgraph repository.
    ```sh
    cp .env.example .env
    ```
    Don't forget to set the `ALCHEMY_API_KEY` variable in your `.env`!

1. Now it's time to set up the local subgraph. If you don't already have `docker` and [`docker-compose`](https://github.com/docker/compose) installed, install them.

1. Run a local chain and subgraph node with
    ```sh
    docker-compose -f docker-compose-forking.yml up -d
    ```
    > make sure you have Docker version 20 or great if you're on Linux for internal host support

1. Deploy the FIAT subgraph to your local node. First we give the `deploy.sh` script permissions to execute, then run it by doing
    ```sh
    sudo chmod +x deploy.sh
    CONFIG=mainnet.json NETWORK=mainnet TARGET=local IPFS_NODE=ipfs:5001 GRAPH_NODE=http://localhost:8030 yarn build
    CONFIG=mainnet.json NETWORK=mainnet TARGET=local IPFS_NODE=ipfs:5001 GRAPH_NODE=http://localhost:8030 yarn build
    ```
    When prompted with an input like
    `? Version Label (e.g. v0.0.1) ‣  _ `
    hit enter to deploy the subgraph.

1. Now open the dapp on [localhost:3000](localhost:3000) and connect to the Localhost Mainnet network. You should be able to create and manage positions.

1. When you're done, run `docker-compose down -v` to tear the containers down. To run again, just run `docker-compose -f docker-compose-forking.yml up -d` again. Your chain will pick up where you left off.

1. If you run into errors, you might have done something out of order. To try again, go into the subgraph repo and tear the containers down, delete the data directory, and bring the containers back up with
    ```sh
    sudo rm -rf ./data
    docker-compose -f docker-compose-forking.yml down -v
    docker-compose -f docker-compose-forking.yml up -d 
    ```

#### Getting tokens on Forked Mainnet chain
1. After setting up your `.env.local` file & installing dependencies, run a local testnet with
    ```sh 
    yarn testnet
    ```

1. In another terminal, run the frontend with
    ```sh
    yarn dev
    ```

#### Getting tokens to test with on Forked Mainnet

1. When running a local chain, import the first account into your wallet via private key. See here for metamask [instructions](https://metamask.zendesk.com/hc/en-us/articles/360015489331-How-to-import-an-account#h_01G01W07NV7Q94M7P1EBD5BYM4).

1. Ensure you have the Localhost Network in your wallet.

1. Take note of the address and private key of the first ganache account and run
    ```sh
    yarn transferLocalhostTokens --to=<first_account_address> --private-key=<first_account_private_key>
    ```
    to transfer stablecoins into your imported account. After running, you should have thousands of stablecoins to test with!
    > Note: To see the balances in your wallet, you may have to import the tokens. Here's a [guide for importing tokens to metamask](https://metamask.zendesk.com/hc/en-us/articles/360015489031-How-to-add-unlisted-tokens-custom-tokens-in-MetaMask). The USDC address is `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`, and the DAI address is `0x6B175474E89094C44Da98b954EedeAC495271d0F`.


1. You're done! You can now open positions via underlier and buidl!

## How to Contribute
To contribute, start by grabbing one of the open issues on the repo, and assigning it to yourself. Once the task has been completed, open a PR against the `main` branch.

## Helpful Testnet Links
- Goerli USDC Faucet: https://goerli.etherscan.io/address/0x08034634bbd210485c9c8f798afdc5432782fd18#writeContract
- Element.fi: https://testnet.element.fi/mint
- Notional.finance: https://goerli.notional.finance/lend/DAI

