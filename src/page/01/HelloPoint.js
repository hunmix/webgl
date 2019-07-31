import React, { useEffect, useState } from 'react'
import Canvas from '@page/canvas'

function HelloPoint () {
  const [gl, setGl] = useState()
  useEffect(() => {
    if (gl) {
      gl.clearColor(0.0, 0.0, 1.0, 1.0)
      gl.clear(gl.COLOR_BUFFER_BIT) // 清空颜色缓冲区
    }
  }, [gl])
  return (
    <Canvas set={setGl}></Canvas> 
  )
}

export default HelloPoint
