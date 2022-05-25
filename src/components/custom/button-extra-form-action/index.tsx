import ButtonOutlineGradient from '@/src/components/antd/button-outline-gradient'
import Plus from '@/src/resources/svg/gradient-plus.svg'
import { ButtonProps } from 'antd/lib/button'

interface Props extends ButtonProps {
  onClick: () => void
}

export const ButtonExtraFormAction: React.FC<Props> = ({ children, onClick, ...restProps }) => (
  <ButtonOutlineGradient onClick={onClick} textGradient {...restProps}>
    <Plus />
    {children}
  </ButtonOutlineGradient>
)
