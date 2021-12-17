import { ReactNode } from 'react'

import DashboardInactive from '@/src/components/assets/dashboard-inactive.svg'
import DashboardActive from '@/src/components/assets/dashboard-active.svg'
import OpenPositionInactive from '@/src/components/assets/open-position-inactive.svg'
import OpenPositionActive from '@/src/components/assets/open-position-active.svg'
import YourPositionsInactive from '@/src/components/assets/your-positions-inactive.svg'
import YourPositionsActive from '@/src/components/assets/your-positions-active.svg'
import LiquidationsInactive from '@/src/components/assets/liquidations-inactive.svg'
import LiquidationsActive from '@/src/components/assets/liquidations-active.svg'

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
