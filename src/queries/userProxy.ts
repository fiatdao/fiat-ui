import gql from 'graphql-tag'

export const USER_PROXY = gql`
  query userProxy($id: ID!) {
    userProxy(id: $id) {
      id
      proxyAddress
    }
  }
`
