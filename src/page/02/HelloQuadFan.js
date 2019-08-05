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
        attribute vec4 a_Position;
        void main () {
          gl_Position = a_Position;
          gl_PointSize = 10.0;
        }
      `
      // 片元着色器
      const FSHADER_SOURCE = `
        void main () {
          gl_FragColor = vec4(1.0, 0.0, 0.0, 1);
        }
      `
      utils.initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE) // 初始化着色器
      const vertices = new Float32Array([
        -0.5, -0.5, 0.0, 0.0, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5
      ])

      const vertexBuffer = gl.createBuffer() // 创建缓冲区
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer) // 将缓冲区对象绑定到目标, ARRAY_BUFFER(表示缓冲区对象中包含了顶点数据)
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW) // 向缓冲区中写入数据
      const a_Position = gl.getAttribLocation(gl.program, 'a_Position') // 向缓冲区中写入数据
      gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0) // 将缓冲区对象分配给a_Position
      gl.enableVertexAttribArray(a_Position) // 连接a_Position和缓冲区对象

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 5)
    }
  }, [gl])
  return (
    <Canvas set={setGl}></Canvas> 
  )
}

export default HelloPoint
