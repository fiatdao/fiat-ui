import { Text } from '@/src/components/custom/typography'
import React from 'react'
import AntdNotification from 'antd/lib/notification'
import AntdResult from 'antd/lib/result'

type State = {
  error?: Error
}

export default class ErrorBoundary extends React.Component<any, State> {
  constructor(props: any) {
    super(props)

    this.state = {
      error: undefined,
    }
  }

  componentDidCatch(error: Error) {
    this.setState({
      error,
    })

    AntdNotification.error({
      message: error.message,
    })
  }

  handleRefresh = () => {
    window.location.href = `${window.location.href}`
  }

  render() {
    if (this.state.error) {
      return (
        <AntdResult
          className="absolute-center"
          extra={
            <button
              className="button-primary button-small"
              onClick={this.handleRefresh}
              style={{ margin: '0 auto' }}
              type="button"
            >
              Refresh page
            </button>
          }
          status="500"
          subTitle={
            <Text color="secondary" type="p2" weight="semibold">
              Sorry, something went wrong.
            </Text>
          }
          title={
            <Text color="primary" type="h2" weight="semibold">
              500
            </Text>
          }
        />
      )
    }

    return this.props.children
  }
}
