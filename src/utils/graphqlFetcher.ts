import {
  ChainsValues,
  INITIAL_APP_CHAIN_ID,
  chainsConfig,
  isValidChain,
} from '@/src/constants/chains'
import { DocumentNode } from 'graphql'
import { GraphQLClient } from 'graphql-request'

const fetcher = new GraphQLClient(chainsConfig[INITIAL_APP_CHAIN_ID]?.subgraphApi)

export const graphqlFetcher = <Response, Variables = void>(
  appChainId: ChainsValues,
  query: DocumentNode,
  variables?: Variables,
) => {
  const endpoint = isValidChain(appChainId)
    ? chainsConfig[appChainId].subgraphApi
    : chainsConfig[INITIAL_APP_CHAIN_ID].subgraphApi

  return fetcher.setEndpoint(endpoint).request<Response>(query, variables)
}
