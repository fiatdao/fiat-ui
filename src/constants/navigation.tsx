import { ReactNode } from 'react'

import DashboardInactive from '@/src/resources/svg/dashboard-inactive.svg'
import DashboardActive from '@/src/resources/svg/dashboard-active.svg'
import OpenPositionInactive from '@/src/resources/svg/open-position-inactive.svg'
import OpenPositionActive from '@/src/resources/svg/open-position-active.svg'
import YourPositionsInactive from '@/src/resources/svg/your-positions-inactive.svg'
import YourPositionsActive from '@/src/resources/svg/your-positions-active.svg'
import LiquidationsInactive from '@/src/resources/svg/liquidations-inactive.svg'
import LiquidationsActive from '@/src/resources/svg/liquidations-active.svg'

const DASHBOARD = '/dashboard'
const OPEN_POSITION = '/open-position'
const YOUR_POSITIONS = '/your-positions'
const LIQUIDATIONS = '/liquidations'

type RouteItem = {
  icon: ReactNode
  iconSelected: ReactNode
  title: string
  to: string
  key: string
}

const DashboardRoute: RouteItem = {
  to: DASHBOARD,
  icon: <DashboardInactive />,
  iconSelected: <DashboardActive />,
  title: 'Dashboard',
  key: 'dashboard',
}

const OpenPositionRoute: RouteItem = {
  to: OPEN_POSITION,
  icon: <OpenPositionInactive />,
  iconSelected: <OpenPositionActive />,
  title: 'Open position',
  key: 'open-position',
}

const YourPositionsRoute: RouteItem = {
  to: YOUR_POSITIONS,
  icon: <YourPositionsInactive />,
  iconSelected: <YourPositionsActive />,
  title: 'Your Positions',
  key: 'your-positions',
}

const LiquidationsRoute: RouteItem = {
  to: LIQUIDATIONS,
  icon: <LiquidationsInactive />,
  iconSelected: <LiquidationsActive />,
  title: 'Liquidations',
  key: 'liquidations',
}

const routesConfig: Record<string, RouteItem> = {
  [DASHBOARD]: DashboardRoute,
  [OPEN_POSITION]: OpenPositionRoute,
  [YOUR_POSITIONS]: YourPositionsRoute,
  [LIQUIDATIONS]: LiquidationsRoute,
}

const routes: RouteItem[] = [
  DashboardRoute,
  OpenPositionRoute,
  YourPositionsRoute,
  LiquidationsRoute,
]

export { routesConfig, routes }
