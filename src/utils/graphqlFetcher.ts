import { SUBGRAPH_API } from '../constants/misc'
import { DocumentNode } from 'graphql'
import { GraphQLClient } from 'graphql-request'

const fetcher = new GraphQLClient(SUBGRAPH_API)

export const graphqlFetcher = <Response, Variables = void>(
  query: DocumentNode,
  variables?: Variables,
) => fetcher.request<Response>(query, variables)
