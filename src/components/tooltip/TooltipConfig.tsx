import ReactTooltip from 'react-tooltip'

export default function TooltipConfig() {
  return (
    <ReactTooltip
      arrowColor="#14171A"
      backgroundColor="#14171A"
      border
      borderColor="rgba(219, 219, 219, 0.2)"
      className="customTooltip"
      delayHide={250}
      delayShow={0}
      effect="solid"
      textColor="#D6D7DC"
    />
  )
}
