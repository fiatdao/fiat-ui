#!/usr/bin/env bash

if [ -f .env.local ]; then
  echo "Importing environment variables from .env.local"
  set -o allexport; source .env.local; set +o allexport
fi

SCHEMA_OUTPUT_FILE="types/subgraph/graphql-schema.json"
GENERATED_OUTPUT_FOLDER="types/subgraph/__generated__"

if [ -z "$NEXT_PUBLIC_REACT_APP_SUBGRAPH_GOERLI" ]
then
  echo "NEXT_PUBLIC_REACT_APP_SUBGRAPH_GOERLI must be set"
  exit 1
fi

apollo service:download --endpoint="$NEXT_PUBLIC_REACT_APP_SUBGRAPH_GOERLI" $SCHEMA_OUTPUT_FILE

apollo codegen:generate --localSchemaFile=$SCHEMA_OUTPUT_FILE --target=typescript $GENERATED_OUTPUT_FOLDER --outputFlat --passthroughCustomScalars --customScalarsPrefix=Subgraph_
