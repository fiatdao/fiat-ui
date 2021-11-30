import useSWR from 'swr'
import axios from 'axios'

import { Metadata } from '@/types/metadata'

export default function useMetadata(ipfsUrl: string) {
  const { data = null } = useSWR(ipfsUrl, async (ipfsUrl) => {
    const ipfsHash = ipfsUrl.replace('ipfs://', '')
    const httpUrl = `https://ipfs.io/ipfs/${ipfsHash}`
    const res = await axios.get<Metadata>(httpUrl)
    return res.data
  })

  return data
}
