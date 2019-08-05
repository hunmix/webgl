import HelloCanvas from '@page/01/HelloCanvas'
import HelloPoint from '@page/01/HelloPoint'
import HelloPoint2 from '@page/01/HelloPoint2'
import ClickedPoint from '@page/01/ClickedPoint'
import ColoredPoints from '@page/01/ColoredPoints'
import MultiPoint from '@page/02/MultiPoint'
import HelloTriangle from '@page/02/HelloTriangle'
import HelloRectangle from '@page/02/HelloRectangle'
import HelloQuadFan from '@page/02/HelloQuadFan'

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
  },
  {
    path: '/02/MultiPoint',
    component: MultiPoint
  },
  {
    path: '/02/HelloTriangle',
    component: HelloTriangle
  },
  {
    path: '/02/HelloRectangle',
    component: HelloRectangle
  },
  {
    path: '/02/HelloQuadFan',
    component: HelloQuadFan
  }
]

export default routes
