import metadataGoerli from './metadata-goerli.json'
import metadataMainnet from './metadata-mainnet.json'
import deploymentGoerli from './deployment-goerli.json'
import deploymentMainnet from './deployment-mainnet.json'

export const metadataByNetwork = {
  1: metadataMainnet,
  5: metadataGoerli,
}

export const contractsByNetwork = {
  1: deploymentMainnet,
  5: deploymentGoerli,
}
