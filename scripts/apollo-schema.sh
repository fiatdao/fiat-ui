#!/usr/bin/env bash

set -o allexport; source .env; set +o allexport

OUTPUT_FILE="../types/subgraph/graphql-schema.json"

if [ -z $NEXT_PUBLIC_REACT_APP_SUBGRAPH_API ]
then
  echo "NEXT_PUBLIC_REACT_APP_SUBGRAPH_API must be set"
  exit 1
fi

npx apollo service:download --endpoint=$NEXT_PUBLIC_REACT_APP_SUBGRAPH_API $OUTPUT_FILE
