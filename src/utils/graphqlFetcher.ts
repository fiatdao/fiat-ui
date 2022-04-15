import { DocumentNode } from 'graphql'
import { GraphQLClient } from 'graphql-request'
import {
  ChainsValues,
  INITIAL_APP_CHAIN_ID,
  chainsConfig,
  isValidChain,
} from '@/src/constants/chains'

const fetcher = new GraphQLClient(chainsConfig[INITIAL_APP_CHAIN_ID]?.subgraphApi)

export const graphqlFetcher = <Response, Variables = void>(
  appChainId: ChainsValues,
  query: DocumentNode,
  variables?: Variables,
) => {
  let endpoint

  if (isValidChain(appChainId)) {
    endpoint = chainsConfig[appChainId].subgraphApi
  } else {
    endpoint = chainsConfig[INITIAL_APP_CHAIN_ID].subgraphApi
  }

  return fetcher.setEndpoint(endpoint).request<Response>(query, variables)
}
