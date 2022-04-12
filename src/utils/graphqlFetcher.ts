import { DocumentNode } from 'graphql'
import { GraphQLClient } from 'graphql-request'
import { Chains, ChainsValues, chainsConfig } from '@/src/constants/chains'

// we initialize always in GOERLI
const fetcher = new GraphQLClient(chainsConfig[Chains.goerli].subgraphApi)

export const graphqlFetcher = <Response, Variables = void>(
  appChainId: ChainsValues,
  query: DocumentNode,
  variables?: Variables,
) => {
  fetcher.setEndpoint(chainsConfig[appChainId].subgraphApi)
  return fetcher.request<Response>(query, variables)
}
