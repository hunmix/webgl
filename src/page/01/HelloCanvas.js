import React, { useEffect, useState } from 'react'
import Canvas from '@page/canvas'
// gl.COLOR_BUFFER_BIT   //颜色缓冲区
// gl.DEPTH_BUFFER_BIT   //深度缓冲区
// gl.STENCIL_BUFFER_BIT  //模板缓冲区
// MDN: https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/clear
function HelloCanvas () {
  const [gl, setGl] = useState()
  useEffect(() => {
    if (gl) { // TODO: mounted效果怎么做到?
      gl.clearColor(0.0, 0.0, 0.0, 1.0)
      gl.clear(gl.COLOR_BUFFER_BIT) // 清空颜色缓冲区
    }
  }, [gl])
  return (
    <Canvas set={setGl}></Canvas> 
  )
}

export default HelloCanvas
