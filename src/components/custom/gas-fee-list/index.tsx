import s from './s.module.scss'
import RadioButton from '../../../../../fiat-dapp/src/components/antd/radio-button'
import React from 'react'
import AntdRadio, { RadioChangeEvent, RadioGroupProps } from 'antd/lib/radio'
import AntdSpin from 'antd/lib/spin'
import useMergeState from 'hooks/useMergeState'
import { fetchGasPrice } from '@/src/web3/utils'

import Grid from '@/src/components/custom/grid'
import { Text } from '@/src/components/custom/typography'

type GasFeeOption = {
  key: string
  name: string
  value: number
}

type GasFeeListState = {
  options: GasFeeOption[]
  loading: boolean
  selected?: GasFeeOption
}

export type GasFeeListProps = RadioGroupProps & {
  value?: GasFeeOption
  onChange?: (value: GasFeeOption) => void
}

const GasFeeList: React.FC<GasFeeListProps> = (props) => {
  const { className, onChange, value, ...groupProps } = props

  const [state, setState] = useMergeState<GasFeeListState>({
    options: [],
    loading: false,
    selected: undefined,
  })

  React.useEffect(() => {
    setState({
      loading: true,
    })

    fetchGasPrice()
      .then((result) => {
        const options = [
          {
            key: 'fastest',
            name: 'Very fast',
            value: result.veryFast,
          },
          {
            key: 'fast',
            name: 'Fast',
            value: result.fast,
          },
          {
            key: 'average',
            name: 'Standard',
            value: result.average,
          },
          {
            key: 'safeLow',
            name: 'Slow',
            value: result.safeLow,
          },
        ]

        setState({
          loading: false,
          options,
        })
      })
      .catch(() => {
        setState({
          loading: false,
        })
      })
  })

  React.useEffect(() => {
    if (value === undefined && state.options.length > 2) {
      props.onChange?.(state.options[2])
    }
  }, [value, state.options, props])

  function handleChange(ev: RadioChangeEvent) {
    props.onChange?.(ev.target.value)
  }

  React.useEffect(() => {
    setState({
      selected: value,
    })
  }, [setState, value])

  return (
    <AntdRadio.Group
      className={className}
      style={{ width: '100%' }}
      {...groupProps}
      onChange={handleChange}
      value={state.selected}
    >
      {state.loading ? (
        <AntdSpin />
      ) : (
        <div className={s.list}>
          {state.options.map((option) => (
            <RadioButton
              hint={
                <Grid flow="col" gap={4}>
                  <Text color="primary" type="p1" weight="500">
                    {option.value}
                  </Text>
                  <Text color="secondary" type="p2" weight="500">
                    Gwei
                  </Text>
                </Grid>
              }
              key={option.key}
              label={
                <Text
                  color="primary"
                  style={{ textTransform: 'uppercase' }}
                  type="lb2"
                  weight="500"
                >
                  {option.name}
                </Text>
              }
              value={option}
            />
          ))}
        </div>
      )}
    </AntdRadio.Group>
  )
}

export default GasFeeList
