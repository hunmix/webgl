import HelloCanvas from '@page/01/HelloCanvas'
import HelloPoint from '@page/01/HelloPoint'
import HelloPoint2 from '@page/01/HelloPoint2'
import ClickedPoint from '@page/01/ClickedPoint'
import ColoredPoints from '@page/01/ColoredPoints'

import MultiPoint from '@page/02/MultiPoint'
import HelloTriangle from '@page/02/HelloTriangle'
import HelloRectangle from '@page/02/HelloRectangle'
import HelloQuadFan from '@page/02/HelloQuadFan'
import TranslatedTriangle from '@page/02/TranslatedTriangle'
import RotatedTriangle from '@page/02/RotatedTriangle'
import RotatedTriangleMatrix from '@page/02/RotatedTriangleMatrix'

import RotatedTranslatedTriangle from '@page/03/RotatedTranslatedTriangle'
import RotatingTriangle from '@page/03/RotatingTriangle'

import MultiAttributeSize from '@page/04/MultiAttributeSize'
import MultiAttributeColor from '@page/04/MultiAttributeColor'
import TextureQuad from '@page/04/TextureQuad'

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
  },
  {
    path: '/02/TranslatedTriangle',
    component: TranslatedTriangle
  },
  {
    path: '/02/RotatedTriangle',
    component: RotatedTriangle
  },
  {
    path: '/02/RotatedTriangleMatrix',
    component: RotatedTriangleMatrix
  },
  {
    path: '/03/RotatedTranslatedTriangle',
    component: RotatedTranslatedTriangle
  },
  {
    path: '/03/RotatingTriangle',
    component: RotatingTriangle
  },
  {
    path: '/04/MultiAttributeSize',
    component: MultiAttributeSize
  },
  {
    path: '/04/MultiAttributeColor',
    component: MultiAttributeColor
  },
  {
    path: '/04/TextureQuad',
    component: TextureQuad
  }
]

export default routes
