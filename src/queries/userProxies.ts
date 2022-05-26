import gql from 'graphql-tag'

export const USER_PROXIES = gql`
  query userProxies($where: UserProxy_filter) {
    userProxies(where: $where) {
      id
      owner
      proxyAddress
    }
  }
`
