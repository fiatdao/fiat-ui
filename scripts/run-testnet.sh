#!/usr/bin/env bash
set -o errexit

if [ -f .env.local ]; then
  set -o allexport; source .env.local; set +o allexport
fi

yarn run ganache \
	--fork.url=https://eth-mainnet.alchemyapi.io/v2/$ALCHEMY_API_KEY \
	--miner.defaultGasPrice 30000000000 \
	--chain.vmErrorsOnRPCResponse=true \
  --unlock="0xCFFAd3200574698b78f32232aa9D63eABD290703" \
  --unlock="0x16b34ce9a6a6f7fc2dd25ba59bf7308e7b38e186"