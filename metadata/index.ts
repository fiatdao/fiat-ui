import metadataGoerli from './metadata-goerli.json'
import metadataMainnet from './metadata-mainnet.json'
import deploymentGoerli from './deployment-goerli.json'
import deploymentMainnet from './deployment-mainnet.json'

export const metadataByNetwork = {
  1337: metadataMainnet,
  1: metadataMainnet,
  5: metadataGoerli,
}

export const contractsByNetwork = {
  1337: deploymentMainnet,
  1: deploymentMainnet,
  5: deploymentGoerli,
}
