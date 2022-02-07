import { SUBGRAPH_API } from '../constants/misc'
import { DocumentNode } from 'graphql'
import { GraphQLClient } from 'graphql-request'

const graphqlFetcher = new GraphQLClient(SUBGRAPH_API)
export const swrFetcher = <Response, Variables = void>(
  query: DocumentNode,
  variables?: Variables,
) => graphqlFetcher.request<Response>(query, variables)
