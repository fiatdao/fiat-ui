import { ReactNode } from 'react'

import Dashboard from '@/src/resources/svg/dashboard.svg'
import DashboardActive from '@/src/resources/svg/dashboard-active.svg'
import OpenPosition from '@/src/resources/svg/open-position.svg'
import OpenPositionActive from '@/src/resources/svg/open-position-active.svg'
import YourPositions from '@/src/resources/svg/your-positions.svg'
import YourPositionsActive from '@/src/resources/svg/your-positions-active.svg'
import Auctions from '@/src/resources/svg/auctions.svg'
import AuctionsActive from '@/src/resources/svg/auctions-active.svg'

const DASHBOARD = '/dashboard'
const OPEN_POSITION = '/open-position'
const YOUR_POSITIONS = '/your-positions'
const AUCTIONS = '/auctions'

export type RouteItem = {
  icon: ReactNode
  iconActive: ReactNode
  key: string
  title: string
  to: string
}

const DashboardRoute: RouteItem = {
  to: DASHBOARD,
  icon: <Dashboard />,
  iconActive: <DashboardActive />,
  title: 'Dashboard',
  key: 'dashboard',
}

const OpenPositionRoute: RouteItem = {
  to: OPEN_POSITION,
  icon: <OpenPosition />,
  iconActive: <OpenPositionActive />,
  title: 'Open position',
  key: 'open-position',
}

const YourPositionsRoute: RouteItem = {
  to: YOUR_POSITIONS,
  icon: <YourPositions />,
  iconActive: <YourPositionsActive />,
  title: 'Your Positions',
  key: 'your-positions',
}

const LiquidationsRoute: RouteItem = {
  to: AUCTIONS,
  icon: <Auctions />,
  iconActive: <AuctionsActive />,
  title: 'Auctions',
  key: 'auctions',
}

const routesConfig: Record<string, RouteItem> = {
  [DASHBOARD]: DashboardRoute,
  [OPEN_POSITION]: OpenPositionRoute,
  [YOUR_POSITIONS]: YourPositionsRoute,
  [AUCTIONS]: LiquidationsRoute,
}

const routes: RouteItem[] = [
  DashboardRoute,
  OpenPositionRoute,
  YourPositionsRoute,
  LiquidationsRoute,
]

export { routesConfig, routes }
