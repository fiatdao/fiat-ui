import ButtonOutlineGradient from '@/src/components/antd/button-outline-gradient'
import Plus from '@/src/resources/svg/gradient-plus.svg'

interface Props {
  onClick: () => void
}

export const ButtonMintFiat: React.FC<Props> = ({ onClick, ...restProps }) => (
  <ButtonOutlineGradient onClick={onClick} textGradient {...restProps}>
    <Plus />
    Mint FIAT with this transaction
  </ButtonOutlineGradient>
)
