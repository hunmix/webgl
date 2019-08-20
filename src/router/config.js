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
import MultiTexture from '@page/04/MultiTexture'

import LookAtTriangle from '@page/05/LookAtTriangle'
import LookAtTriangleMatrix from '@page/05/LookAtTriangleMatrix'
import OrthoView from '@page/05/OrthoView'
import PerspectiveView from '@page/05/PerspectiveView'
import Zfighting from '@page/05/Zfighting'
import HelloCube from '@page/05/HelloCube'
import ColoredCube from '@page/05/ColoredCube'

import LightedCube from '@page/06/LightedCube'
import LightedCubeAmbient from '@page/06/LightedCubeAmbient'
import LightedTranslatedRotatedCube from '@page/06/LightedTranslatedRotatedCube'

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
  },
  {
    path: '/04/MultiTexture',
    component: MultiTexture
  },
  {
    path: '/05/LookAtTriangle',
    component: LookAtTriangle
  },
  {
    path: '/05/LookAtTriangleMatrix',
    component: LookAtTriangleMatrix
  },
  {
    path: '/05/OrthoView',
    component: OrthoView
  },
  {
    path: '/05/PerspectiveView',
    component: PerspectiveView
  },
  {
    path: '/05/Zfighting',
    component: Zfighting
  },
  {
    path: '/05/HelloCube',
    component: HelloCube
  },
  {
    path: '/05/ColoredCube',
    component: ColoredCube
  },
  {
    path: '/06/LightedCube',
    component: LightedCube
  },
  {
    path: '/06/LightedCubeAmbient',
    component: LightedCubeAmbient
  },
  {
    path: '/06/LightedTranslatedRotatedCube',
    component: LightedTranslatedRotatedCube
  }
]

export default routes
