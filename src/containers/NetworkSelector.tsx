import styled from 'styled-components'
import { $enum } from 'ts-enum-util'

import { ChevronDown as BaseChevronDown } from '@/src/components/assets/ChevronDown'
import { Dropdown } from '@/src/components/common/Dropdown'
import { ButtonPrimary } from '@/src/components/pureStyledComponents/buttons/Button'
import { Chains, ChainsValues, chainsConfig } from '@/src/constants/chains'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'

const ButtonWrapper = styled.div`
  margin-left: 10px;
`

const ChevronDown = styled(BaseChevronDown)`
  margin-left: 10px;
`

export default function NetworkSelector() {
  const chainOptions = $enum(Chains).map((value, key) => ({
    value,
    label: key,
  }))

  const { appChainId, setAppChainId } = useWeb3Connection()

  return (
    <ButtonWrapper>
      <Dropdown
        dropdownButtonContent={
          <ButtonPrimary>
            {chainsConfig[appChainId].name}
            <ChevronDown />
          </ButtonPrimary>
        }
        items={chainOptions.map(({ label, value }) => ({
          label,
          key: value.toString(),
          isActive: value === appChainId,
        }))}
        onItemChange={(key: string) => setAppChainId(Number(key) as ChainsValues)}
      />
    </ButtonWrapper>
  )
}
