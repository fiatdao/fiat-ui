import { Close } from '@/src/components/assets/Close'

export const CloseButton = ({ closeToast }: { closeToast: () => void }) => (
  <Close onClick={closeToast} />
)
