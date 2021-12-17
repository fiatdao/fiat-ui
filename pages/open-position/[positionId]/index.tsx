import { Button } from 'antd'
import Link from 'next/link'
import { useRouter } from 'next/router'

const PositionManager = () => {
  const router = useRouter()
  const { positionId } = router.query

  return (
    <>
      <Link href="/open-position" passHref>
        <Button>Back</Button>
      </Link>
      <h1>{positionId}</h1>
    </>
  )
}

export default PositionManager
