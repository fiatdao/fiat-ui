import Image from 'next/image'
import styled from 'styled-components'

type Props = {
  ipfsUrl: string
  width: number
  height: number
}

const ImageWrapper = styled.div<{ width: number; height: number }>`
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  position: relative;
`

export default function ImageIPFS({ height, ipfsUrl, width }: Props) {
  const ipfsHash = ipfsUrl.replace('ipfs://', '')
  const httpUrl = `https://ipfs.io/ipfs/${ipfsHash}`

  return (
    <ImageWrapper height={height} width={width}>
      <Image
        alt={httpUrl}
        blurDataURL="/loading.jpeg"
        layout="fill"
        placeholder="blur"
        src={httpUrl}
      />
    </ImageWrapper>
  )
}
