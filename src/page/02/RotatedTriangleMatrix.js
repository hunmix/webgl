import React, { useEffect, useState } from 'react'
import Canvas from '@page/canvas'
import utils from '@/lib/index' // 初始化着色器, 细节先不管
function HelloPoint () {
  const [gl, setGl] = useState()
  useEffect(() => {
    if (gl) {
      // 顶点着色器
      const VSHADER_SOURCE = `
      attribute vec4 a_Position;
      uniform mat4 u_xformMatrix; // 平移量
      void main() {
        gl_Position = u_xformMatrix * a_Position; // 设置坐标
      }
      `
      // 片元着色器
      const FSHADER_SOURCE = `
      void main() {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // 设置颜色
      }
      `
      utils.initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE) // 初始化着色器
      
      gl.clear(gl.COLOR_BUFFER_BIT) // 清空颜色缓冲区
      
      gl.clearColor(0.0, 0.0, 0.0, 1.0)
      draw('rotate')
      // const vertexBuffer = gl.createBuffer() // 创建缓冲区
      // gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer) // 将缓冲区对象绑定到目标, ARRAY_BUFFER(表示缓冲区对象中包含了顶点数据)
      // gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW) // 向缓冲区中写入数据
      // const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
      // gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0) // 将缓冲区对象分配给a_Position

      // const u_xformMatrix = gl.getUniformLocation(gl.program, 'u_xformMatrix') // 获取平移变量位置
      // gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix) // 给平移变量赋值
      // gl.enableVertexAttribArray(a_Position) // 连接a_Position和缓冲区对象
      // // 绘制三个点
      // gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
  }, [gl])
  const draw = (type) => {
    let xformMatrix

    const vertices = new Float32Array([ // 定义三个点坐标
      0.0, 0.5, -0.5, -0.5, 0.5, -0.5
    ])
    // 旋转, 按列主序
    const ANGLE = 90 * Math.PI / 180
    const cosB = Math.cos(ANGLE)
    const sinB = Math.sin(ANGLE)

    const rotateMatrix = new Float32Array([
      cosB, sinB, 0.0, 0.0,
      -sinB, cosB, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0
    ])
    // 平移
    const Tx = 0.5
    const Ty = 0.5
    const Tz = 0.5

    const translateMatrix = new Float32Array([
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      Tx, Ty, Tz, 1.0
    ])

    // 缩放
    const Sx = 1.0
    const Sy = 1.5
    const Sz = 1.0

    const zoomMatrix = new Float32Array([
      Sx, 0.0, 0.0, 0.0,
      0.0, Sy, 0.0, 0.0,
      0.0, 0.0, Sz, 0.0,
      0.0, 0.0, 0.0, 1.0
    ])
    switch (type) {
      case 'rotate':
        xformMatrix = rotateMatrix
        break
      case 'translate':
        xformMatrix = translateMatrix
        break
      case 'zoom':
        xformMatrix = zoomMatrix
        break
    }
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.clearColor(0.0, 0.0, 0.0, 1.0)

    const vertexBuffer = gl.createBuffer() // 创建缓冲区
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer) // 将缓冲区对象绑定到目标, ARRAY_BUFFER(表示缓冲区对象中包含了顶点数据)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW) // 向缓冲区中写入数据
    const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0) // 将缓冲区对象分配给a_Position

    const u_xformMatrix = gl.getUniformLocation(gl.program, 'u_xformMatrix') // 获取平移变量位置
    gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix) // 给平移变量赋值
    gl.enableVertexAttribArray(a_Position) // 连接a_Position和缓冲区对象
    // 绘制三个点
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }
  return (
    <div>
      <Canvas set={setGl}></Canvas>
      <div>
        <button onClick={() => {draw('rotate')}}>旋转</button>
        <button onClick={() => {draw('translate')}}>平移</button>
        <button onClick={() => {draw('zoom')}}>缩放</button>
      </div>
    </div>
  )
}

export default HelloPoint
