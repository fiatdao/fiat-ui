/* eslint-disable  @typescript-eslint/no-var-requires */
const axios = require('axios')
const fs = require('fs')
const stream = require('stream')
const { promisify } = require('util')
const path = require('path')
/* eslint-enable  @typescript-eslint/no-var-requires */

const metadataFilemap = {
  'metadata-goerli':
    'https://raw.githubusercontent.com/fiatdao/changelog/main/metadata/metadata-goerli.json',
  'deployment-goerli':
    'https://raw.githubusercontent.com/fiatdao/changelog/main/deployment/deployment-goerli.json',
  'metadata-mainnet':
    'https://raw.githubusercontent.com/fiatdao/changelog/main/metadata/metadata-mainnet.json',
  'deployment-mainnet':
    'https://raw.githubusercontent.com/fiatdao/changelog/main/deployment/deployment-mainnet.json',
}

const getMetadata = async () => {
  for await (const metadata of Object.keys(metadataFilemap)) {
    const finishedDownload = promisify(stream.finished)
    const writer = fs.createWriteStream(path.join(__dirname, '../', `/metadata/${metadata}.json`))
    const response = await axios({
      method: 'GET',
      url: metadataFilemap[metadata],
      responseType: 'stream',
    })
    response.data.pipe(writer)
    await finishedDownload(writer)
  }
}

getMetadata()
