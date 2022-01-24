import { ColumnsType } from 'antd/lib/table/interface'
import BigNumber from 'bignumber.js'
import cn from 'classnames'

import { formatBigValue, getEtherscanAddressUrl, shortenAddr } from '@/src/web3/utils'
import ExternalLink from '@/src/components/custom/externalLink'
import Identicon from '@/src/components/custom/identicon'
import { Text } from '@/src/components/custom/typography'
import { Table } from '@/src/components/antd'

const data = [
  {
    address: '0x4e83362442b8d1bec281594cea3050c8eb01311c',
    tokensStaked: '438668.792214685437903814',
    lockedUntil: 0,
    delegatedPower: '0',
    votes: 0,
    proposals: 0,
    votingPower: '438668.792214685437903814',
  },
  {
    address: '0xde3258c1c45a557f4924d1e4e3d0a4e5341607ee',
    tokensStaked: '438225.688974931126534583',
    lockedUntil: 0,
    delegatedPower: '0',
    votes: 0,
    proposals: 0,
    votingPower: '438225.688974931126534583',
  },
  {
    address: '0x43a330dec81bbd5e21f41c6b8354e54d481efc93',
    tokensStaked: '339532.479084925327966257',
    lockedUntil: 0,
    delegatedPower: '0',
    votes: 0,
    proposals: 0,
    votingPower: '339532.479084925327966257',
  },
  {
    address: '0xf5b4635f3858a2bc80a17bd4450e05a35ad99a72',
    tokensStaked: '321697.337750868600889035',
    lockedUntil: 1669134883,
    delegatedPower: '0',
    votes: 0,
    proposals: 0,
    votingPower: '628153.13633477022081923979',
  },
  {
    address: '0xfc204fcfd2a579157898a212ea25ac98de2b1e1c',
    tokensStaked: '320086.024893473497725153',
    lockedUntil: 0,
    delegatedPower: '0',
    votes: 0,
    proposals: 0,
    votingPower: '320086.024893473497725153',
  },
  {
    address: '0x0df60e53959504e2aeeca46a5a2e72e860a3666d',
    tokensStaked: '317993.955609772981893173',
    lockedUntil: 0,
    delegatedPower: '0',
    votes: 0,
    proposals: 0,
    votingPower: '317993.955609772981893173',
  },
  {
    address: '0x4d108e41b380aecd04693690996192beee29174c',
    tokensStaked: '233807.693691815843831911',
    lockedUntil: 0,
    delegatedPower: '0',
    votes: 0,
    proposals: 0,
    votingPower: '233807.693691815843831911',
  },
  {
    address: '0xa2ad64b2d890a59ce18c0ddd51a7de9ef69eb3da',
    tokensStaked: '230263.160902531066682431',
    lockedUntil: 0,
    delegatedPower: '0',
    votes: 0,
    proposals: 0,
    votingPower: '230263.160902531066682431',
  },
  {
    address: '0x66d4908e053f7150038b1bf3579cf384fde0ba72',
    tokensStaked: '228865.133585453629757283',
    lockedUntil: 1639933487,
    delegatedPower: '3106',
    votes: 0,
    proposals: 0,
    votingPower: '238211.21696962926706680624',
  },
  {
    address: '0xee160154b02a2e404c6c13ff0b28ed76010cf07d',
    tokensStaked: '212430.46487975144644258',
    lockedUntil: 0,
    delegatedPower: '0',
    votes: 0,
    proposals: 0,
    votingPower: '212430.46487975144644258',
  },
]

const total = 924

const Columns: ColumnsType<any> = [
  {
    title: 'Address',
    dataIndex: 'address',
    render: (value: string) => (
      <div className="flex col-gap-16 align-center">
        <Identicon address={value} height={32} width={32} />
        <ExternalLink className="link-blue" href={getEtherscanAddressUrl(value)}>
          <Text className="hidden-mobile hidden-tablet" color="primary" ellipsis type="p1">
            {value}
          </Text>
          <Text className="hidden-desktop" color="primary" type="p1" wrap={false}>
            {shortenAddr(value)}
          </Text>
        </ExternalLink>
      </div>
    ),
  },
  {
    title: 'Staked Balance',
    dataIndex: 'tokensStaked',
    align: 'right',
    render: (value: BigNumber) => (
      <Text className="ml-auto" color="primary" type="p1">
        {formatBigValue(value, 2, '-', 2)}
      </Text>
    ),
  },
  {
    title: 'Voting Power',
    dataIndex: 'votingPower',
    align: 'right',
    render: (value: BigNumber) => (
      <Text className="ml-auto" color="primary" type="p1">
        {formatBigValue(value, 2, '-', 2)}
      </Text>
    ),
  },
  {
    title: 'Votes',
    dataIndex: 'votes',
    align: 'right',
    render: (value: number) => (
      <Text className="ml-auto" color="primary" type="p1">
        {value}
      </Text>
    ),
  },
  {
    title: 'Proposals',
    dataIndex: 'proposals',
    width: 150,
    align: 'right',
    render: (value: number) => (
      <Text className="ml-auto" color="primary" type="p1">
        {value}
      </Text>
    ),
  },
]

const Liquidations = () => {
  return (
    <>
      <div className="card-header">
        <Text color="primary" font="secondary" type="p1" weight="semibold">
          Voter weights
        </Text>
      </div>
      <Table
        columns={Columns}
        dataSource={data}
        loading={false}
        pagination={{
          total,
          pageSize: 10,
          current: 1,
          position: ['bottomRight'],
          showTotal: (total: number, [from, to]: [number, number]) => (
            <>
              <Text className="hidden-mobile" color="secondary" type="p2" weight="semibold">
                Showing {from} to {to} out of {total} stakers
              </Text>
              <Text
                className="hidden-tablet hidden-desktop"
                color="secondary"
                type="p2"
                weight="semibold"
              >
                {from}..{to} of {total}
              </Text>
            </>
          ),
          onChange: (page: number, pageSize: number) => {
            console.log(page, pageSize)
          },
        }}
        rowKey="address"
        scroll={{
          x: true,
        }}
      />
    </>
  )
}

export default Liquidations
