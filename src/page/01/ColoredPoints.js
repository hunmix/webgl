import React, { useEffect, useState } from 'react'
import Canvas from '@page/canvas'
import utils from '@/lib/index' // 初始化着色器, 细节先不管
function HelloPoint () {
  const [gl, setGl] = useState()
  const points = []
  useEffect(() => {
    if (gl) {
      gl.clearColor(0.0, 0.0, 0.0, 1.0)
      gl.clear(gl.COLOR_BUFFER_BIT) // 清空颜色缓冲区
      // 顶点着色器
      const VSHADER_SOURCE = `
        attribute vec4 a_Position;
        void main() {
          gl_Position = a_Position; // 设置坐标
          gl_PointSize = 10.0; // 设置尺寸
        }
      `
      // 片元着色器, precision mediump float限制精度(神tm卡了我半小时)
      const FSHADER_SOURCE = `
        precision mediump float;
        uniform vec4 u_FragColor;
        void main() {
          gl_FragColor = u_FragColor; // 设置颜色
        }
      `
      utils.initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)
    }
  }, [gl])
  const paintPoint = (e) => {
    let color
    const nativeE = e.nativeEvent
    const x = nativeE.clientX
    const y = nativeE.clientY
    const rect = nativeE.target.getBoundingClientRect()
    const left = rect.left
    const top = rect.top
    const canvasX = nativeE.target.width / 2
    const canvasY = nativeE.target.height / 2

    const pointX = (x - left - canvasX) / canvasX // 坐标轴转换: clinet -> canvas -> webgl
    const pointY = (canvasY - (y - top)) / canvasY
    
    if (pointX < 0 && pointY > 0) { // 第一象限
      color = [1.0, 0.0, 0.0, 1.0]
    } else if (pointX > 0 && pointY > 0) { // 第二象限
      color = [0.0, 1.0, 0.0, 1.0]
    } else if (pointX < 0 && pointY < 0) { // 第三象限
      color = [0.0, 0.0, 1.0, 1.0]
    } else if (pointX > 0 && pointY < 0) { // 第四象限
      color = [1.0, 1.0, 0.0, 1.0]
    }

    points.push({x: pointX, y: pointY, color})
    const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
    const u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor')

    gl.clear(gl.COLOR_BUFFER_BIT) // 清空缓冲区, 缓冲区每次绘制完会丢弃
    points.forEach(point => { // 绘制所有点
      gl.vertexAttrib3f(a_Position, point.x, point.y, 0)
      gl.uniform4f(u_FragColor, point.color[0], point.color[1], point.color[2], point.color[3])
      // 绘制一个点
      gl.drawArrays(gl.POINTS, 0, 1)
    })
  }
  return (
    <Canvas set={setGl} onClick={paintPoint}></Canvas> 
  )
}

export default HelloPoint
