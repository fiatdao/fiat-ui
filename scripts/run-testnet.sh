#!/usr/bin/env bash
set -o errexit

if [ -f .env.local ]; then
  set -o allexport; source .env.local; set +o allexport
fi

yarn run ganache \
	--fork.url=https://eth-mainnet.alchemyapi.io/v2/$ALCHEMY_API_KEY \
  # uncomment line below to fork from a specific block number
	# --fork.url=https://eth-mainnet.alchemyapi.io/v2/$ALCHEMY_API_KEY@15195304 \
	--miner.defaultGasPrice 30000000000 \
	--chain.vmErrorsOnRPCResponse=true \
  --unlock="0xCFFAd3200574698b78f32232aa9D63eABD290703" \
  --unlock="0x16b34ce9a6a6f7fc2dd25ba59bf7308e7b38e186" \
  --unlock="0x3ddfa8ec3052539b6c9549f12cea2c295cff5296"
