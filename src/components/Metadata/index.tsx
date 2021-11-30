import ImageIPFS from '../ImageIPFS'
import useMetadata from '@/src/hooks/useMetadata'

type Props = {
  url: string
}
export default function Metadata({ url }: Props) {
  const data = useMetadata(url)

  if (!data) {
    return null
  }

  return (
    <>
      <p>Name: {data.name}</p>
      <p>Description: {data.description}</p>
      <p>Attributes</p>
      <ImageIPFS height={100} ipfsUrl={data.image} width={100} />
      <ul>
        {data.attributes.map((a) => (
          <li key={a.trait_type}>
            {a.trait_type}: {a.value}
          </li>
        ))}
      </ul>
    </>
  )
}
