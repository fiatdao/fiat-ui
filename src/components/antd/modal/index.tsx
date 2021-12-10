import s from './s.module.scss'
import Button from '../button'
import Grid from '../../custom/grid'
import Icon from '../../custom/icon'
import { Text } from '../../custom/typography'
import React from 'react'
import AntdModal, { ModalProps as AntdModalProps } from 'antd/lib/modal'
import cn from 'classnames'

export type ModalProps = AntdModalProps & {
  confirmClose?: boolean
  confirmText?: React.ReactNode
  onCancel: (e?: React.MouseEvent<HTMLElement>) => void
}

const Modal: React.FC<ModalProps> = (props) => {
  const { children, className, confirmClose = false, confirmText, onCancel, ...modalProps } = props

  const [confirmVisible, showConfirm] = React.useState<boolean>(false)

  function handleCancel() {
    if (confirmClose) {
      showConfirm(true)
    } else {
      onCancel?.()
    }
  }

  return (
    <AntdModal
      centered
      className={cn(s.component, className)}
      closeIcon={<Icon name="close-tiny" />}
      footer={null}
      onCancel={handleCancel}
      visible
      zIndex={1000}
      {...modalProps}
    >
      {children}

      {confirmVisible && (
        <AntdModal
          centered
          className={s.component}
          closeIcon={<></>}
          footer={null}
          onCancel={() => showConfirm(false)}
          visible
          zIndex={1001}
        >
          <Grid flow="row" gap={32}>
            <Text color="secondary" type="p2" weight="semibold">
              {confirmText}
            </Text>
            <Grid flow="col" justify="space-between">
              <Button onClick={() => showConfirm(false)} type="ghost">
                <span>No</span>
              </Button>
              <Button onClick={onCancel} type="primary">
                Yes
              </Button>
            </Grid>
          </Grid>
        </AntdModal>
      )}
    </AntdModal>
  )
}

export default Modal
