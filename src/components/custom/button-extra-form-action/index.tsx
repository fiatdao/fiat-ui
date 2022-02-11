import ButtonOutlineGradient from '@/src/components/antd/button-outline-gradient'
import Plus from '@/src/resources/svg/gradient-plus.svg'

interface Props {
  onClick: () => void
}

export const ButtonExtraFormAction: React.FC<Props> = ({ children, onClick, ...restProps }) => (
  <ButtonOutlineGradient onClick={onClick} textGradient {...restProps}>
    <Plus />
    {children}
  </ButtonOutlineGradient>
)
