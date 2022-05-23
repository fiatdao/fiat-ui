import React from 'react'
import Grid from '@/src/components/custom/grid'
import Modal from '@/src/components/antd/modal'
import { Text } from '@/src/components/custom/typography'

interface Props {
  isOpen: boolean
  // toggleOpen: (active: boolean) => void;
}

const SwapSettingsModal: React.FC<Props> = ({isOpen}: Props) => {

  return (
    <Modal
      maskStyle={{ backdropFilter: 'blur(5px)' }}
      onCancel={() => null}
      visible={isOpen}
      width={568}
    >
      <Grid align="start" flow="row" gap={24}>
        <Grid flow="row" gap={16}>
          <Text color="primary" type="h2" weight="bold">
            Change Network
          </Text>
          <Text color="secondary" type="p1" weight="semibold">
            Connect to a supported network below
          </Text>
          <Text color="secondary" type="p1">
            If you still encounter problems, you may want to switch to a different wallet
          </Text>
        </Grid>
      </Grid>
    </Modal>
  )
}

export default SwapSettingsModal
