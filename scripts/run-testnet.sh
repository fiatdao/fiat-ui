#!/usr/bin/env bash
set -o errexit

if [ -f .env.local ]; then
  set -o allexport; source .env.local; set +o allexport
fi

yarn run ganache \
	--fork.url=https://eth-mainnet.alchemyapi.io/v2/$ALCHEMY_API_KEY \
	--miner.defaultGasPrice 30000000000 \
	--chain.vmErrorsOnRPCResponse=true \
