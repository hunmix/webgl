import HelloCanvas from '@page/01/HelloCanvas'
import HelloPoint from '@page/01/HelloPoint'
import HelloPoint2 from '@page/01/HelloPoint2'
import ClickedPoint from '@page/01/ClickedPoint'
import ColoredPoints from '@page/01/ColoredPoints'

const routes = [
  {
    path: '/01/helloCanvas',
    component: HelloCanvas
  },
  {
    path: '/01/HelloPoint',
    component: HelloPoint
  },
  {
    path: '/01/HelloPoint2',
    component: HelloPoint2
  },
  {
    path: '/01/ClickedPoint',
    component: ClickedPoint
  },
  {
    path: '/01/ColoredPoints',
    component: ColoredPoints
  }
]

export default routes
