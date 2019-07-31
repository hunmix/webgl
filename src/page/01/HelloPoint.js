import React, { useEffect, useState } from 'react'
import Canvas from '@page/canvas'
import utils from '@/lib/index' // 初始化着色器, 细节先不管
function HelloPoint () {
  const [gl, setGl] = useState()
  useEffect(() => {
    if (gl) {
      gl.clearColor(0.0, 0.0, 0.0, 1.0)
      gl.clear(gl.COLOR_BUFFER_BIT) // 清空颜色缓冲区
      // 顶点着色器
      const VSHADER_SOURCE = `
        void main() {
          gl_Position = vec4(0.0, 0.0, 0.0, 1.0); // 设置坐标
          gl_PointSize = 10.0; // 设置尺寸
        }
      `
      // 片元着色器
      const FSHADER_SOURCE = `
        void main() {
          gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // 设置颜色
        }
      `
      utils.initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)
      // 绘制一个点
      gl.drawArrays(gl.POINTS, 0, 1)
    }
  }, [gl])
  return (
    <Canvas set={setGl}></Canvas> 
  )
}

export default HelloPoint
